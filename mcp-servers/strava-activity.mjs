#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

let currentAccessToken = STRAVA_ACCESS_TOKEN;

// Known segment IDs for popular routes
const KNOWN_SEGMENTS = {
  "golden-gate-bridge-northbound": 1149601,
  "golden-gate-bridge-southbound": 1149605,
  "ggb-north": 1149601,
  "ggb-south": 1149605,
  "hawk-hill": 229781,
  "paradise-loop": 624371,
};

async function refreshAccessToken() {
  if (!STRAVA_REFRESH_TOKEN || !STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    throw new Error("Strava refresh credentials not configured");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: STRAVA_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = await response.json();
  currentAccessToken = data.access_token;

  console.error("New access token obtained. Update STRAVA_ACCESS_TOKEN in .mcp.json");

  return currentAccessToken;
}

async function stravaFetch(url, retried = false) {
  if (!currentAccessToken) {
    throw new Error("STRAVA_ACCESS_TOKEN must be set");
  }

  let response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${currentAccessToken}`,
    },
  });

  // If token expired, try to refresh (only once)
  if (response.status === 401 && !retried) {
    currentAccessToken = await refreshAccessToken();
    return stravaFetch(url, true);
  }

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchStravaActivities(date) {
  // Parse date as PST/PDT (UTC-8/UTC-7)
  const dateStr = date + "T00:00:00-08:00";
  const startDate = new Date(dateStr);
  const endDate = new Date(date + "T23:59:59-08:00");

  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  return stravaFetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${startTimestamp}&before=${endTimestamp}`
  );
}

async function fetchActivityDetails(activityId) {
  return stravaFetch(
    `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`
  );
}

async function fetchActivitiesInRange(startDate, endDate, page = 1, perPage = 100) {
  const startTimestamp = Math.floor(new Date(startDate + "T00:00:00-08:00").getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endDate + "T23:59:59-08:00").getTime() / 1000);

  return stravaFetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${startTimestamp}&before=${endTimestamp}&page=${page}&per_page=${perPage}`
  );
}

async function fetchSegmentEfforts(segmentId, startDate, endDate) {
  const startISO = new Date(startDate + "T00:00:00-08:00").toISOString();
  const endISO = new Date(endDate + "T23:59:59-08:00").toISOString();

  return stravaFetch(
    `https://www.strava.com/api/v3/segment_efforts?segment_id=${segmentId}&start_date_local=${startISO}&end_date_local=${endISO}`
  );
}

async function searchSegment(query) {
  // Search for segments by name
  // Note: This requires the segment scope
  const bounds = "37.7,-122.6,37.9,-122.3"; // SF Bay Area bounds
  return stravaFetch(
    `https://www.strava.com/api/v3/segments/explore?bounds=${bounds}&activity_type=riding`
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDistance(meters) {
  const miles = meters * 0.000621371;
  return miles.toFixed(1);
}

function formatSpeed(metersPerSec) {
  const mph = metersPerSec * 2.23694;
  return mph.toFixed(1);
}

function formatActivityAsMarkdown(activities) {
  if (activities.length === 0) {
    return "No Strava activities";
  }

  const lines = activities.map((activity) => {
    const time = formatDuration(activity.moving_time);
    const distance = formatDistance(activity.distance);
    const avgSpeed = formatSpeed(activity.average_speed);

    let stats = [`${distance} mi`, `${time}`];

    if (activity.type === "Ride" || activity.type === "VirtualRide") {
      stats.push(`${avgSpeed} mph avg`);
      if (activity.average_watts) {
        stats.push(`${Math.round(activity.average_watts)}W avg`);
      }
      if (activity.total_elevation_gain) {
        const elevationFt = Math.round(activity.total_elevation_gain * 3.28084);
        stats.push(`${elevationFt}ft elevation`);
      }
    } else if (activity.type === "Run") {
      const paceSeconds = activity.moving_time / (activity.distance / 1609.34);
      const pace = paceSeconds / 60;
      const paceMin = Math.floor(pace);
      const paceSec = Math.round((pace - paceMin) * 60);
      stats.push(`${paceMin}:${paceSec.toString().padStart(2, '0')}/mi pace`);

      if (activity.average_heartrate) {
        stats.push(`${Math.round(activity.average_heartrate)} bpm avg`);
      }
    } else if (activity.type === "Swim") {
      const pace = (activity.moving_time / activity.distance) * 100;
      const paceMin = Math.floor(pace / 60);
      const paceSec = Math.round(pace % 60);
      stats.push(`${paceMin}:${paceSec.toString().padStart(2, '0')}/100m pace`);
    }

    return `- **${activity.type}**: [${activity.name}](https://www.strava.com/activities/${activity.id}) • ${stats.join(" • ")}`;
  });

  return lines.join("\n");
}

async function countSegmentCrossings(segmentId, startDate, endDate) {
  // Fetch all activities in the date range
  const allActivities = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await fetchActivitiesInRange(startDate, endDate, page, 100);
    if (activities.length === 0) {
      hasMore = false;
    } else {
      allActivities.push(...activities);
      page++;
      // Safety limit
      if (page > 20) break;
    }
  }

  // For each activity, fetch details to get segment efforts
  const crossings = [];

  for (const activity of allActivities) {
    // Only check rides for segment efforts
    if (activity.type !== "Ride" && activity.type !== "VirtualRide") continue;

    try {
      const details = await fetchActivityDetails(activity.id);

      if (details.segment_efforts) {
        const matchingEfforts = details.segment_efforts.filter(
          (effort) => effort.segment.id === segmentId
        );

        for (const effort of matchingEfforts) {
          crossings.push({
            date: activity.start_date_local.split("T")[0],
            activityId: activity.id,
            activityName: activity.name,
            segmentName: effort.segment.name,
            elapsedTime: effort.elapsed_time,
            movingTime: effort.moving_time,
            prRank: effort.pr_rank,
          });
        }
      }
    } catch (err) {
      console.error(`Error fetching activity ${activity.id}: ${err.message}`);
    }
  }

  return crossings;
}

async function getActivityStats(startDate, endDate) {
  const allActivities = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const activities = await fetchActivitiesInRange(startDate, endDate, page, 100);
    if (activities.length === 0) {
      hasMore = false;
    } else {
      allActivities.push(...activities);
      page++;
      if (page > 20) break;
    }
  }

  // Aggregate stats by activity type
  const statsByType = {};

  for (const activity of allActivities) {
    if (!statsByType[activity.type]) {
      statsByType[activity.type] = {
        count: 0,
        totalDistance: 0,
        totalTime: 0,
        totalElevation: 0,
      };
    }

    statsByType[activity.type].count++;
    statsByType[activity.type].totalDistance += activity.distance || 0;
    statsByType[activity.type].totalTime += activity.moving_time || 0;
    statsByType[activity.type].totalElevation += activity.total_elevation_gain || 0;
  }

  return {
    totalActivities: allActivities.length,
    byType: statsByType,
    activities: allActivities.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      date: a.start_date_local.split("T")[0],
      distance: a.distance,
      movingTime: a.moving_time,
      elevation: a.total_elevation_gain,
    })),
  };
}

const server = new Server(
  {
    name: "strava-activity",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_strava_activity",
        description:
          "Fetch Strava activities for a specific date (rides, runs, swims with stats)",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format (defaults to today)",
            },
          },
        },
      },
      {
        name: "count_segment_crossings",
        description:
          "Count how many times a specific Strava segment was crossed in a date range. " +
          "Known segments: golden-gate-bridge-northbound (ID: 1149601), golden-gate-bridge-southbound (ID: 1149605), " +
          "hawk-hill (ID: 229781). You can use either the name or numeric ID.",
        inputSchema: {
          type: "object",
          properties: {
            segment: {
              type: "string",
              description:
                "Segment name (e.g., 'golden-gate-bridge-northbound', 'ggb-north') or numeric segment ID",
            },
            start_date: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            end_date: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
          },
          required: ["segment", "start_date", "end_date"],
        },
      },
      {
        name: "get_activity_stats",
        description:
          "Get aggregated activity statistics for a date range, including totals by activity type",
        inputSchema: {
          type: "object",
          properties: {
            start_date: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            end_date: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
          },
          required: ["start_date", "end_date"],
        },
      },
      {
        name: "get_activity_details",
        description:
          "Get detailed information about a specific activity including segment efforts",
        inputSchema: {
          type: "object",
          properties: {
            activity_id: {
              type: "number",
              description: "The Strava activity ID",
            },
          },
          required: ["activity_id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "fetch_strava_activity") {
      const date = args?.date || new Date().toISOString().split("T")[0];
      const activities = await fetchStravaActivities(date);
      const markdown = formatActivityAsMarkdown(activities);

      return {
        content: [{ type: "text", text: markdown }],
      };
    }

    if (name === "count_segment_crossings") {
      const { segment, start_date, end_date } = args;

      // Resolve segment ID from name or use directly
      let segmentId;
      if (KNOWN_SEGMENTS[segment.toLowerCase()]) {
        segmentId = KNOWN_SEGMENTS[segment.toLowerCase()];
      } else if (!isNaN(parseInt(segment))) {
        segmentId = parseInt(segment);
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Unknown segment: "${segment}". Known segments: ${Object.keys(KNOWN_SEGMENTS).join(", ")}. Or provide a numeric segment ID.`,
            },
          ],
          isError: true,
        };
      }

      const crossings = await countSegmentCrossings(segmentId, start_date, end_date);

      if (crossings.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No crossings found for segment ${segment} (ID: ${segmentId}) between ${start_date} and ${end_date}.`,
            },
          ],
        };
      }

      const lines = [
        `## Segment Crossings: ${crossings[0].segmentName}`,
        `**Total crossings:** ${crossings.length} between ${start_date} and ${end_date}`,
        "",
        "| Date | Activity | Time | PR Rank |",
        "|------|----------|------|---------|",
      ];

      for (const c of crossings) {
        const time = formatDuration(c.movingTime);
        const prRank = c.prRank ? `#${c.prRank}` : "-";
        lines.push(
          `| ${c.date} | [${c.activityName}](https://www.strava.com/activities/${c.activityId}) | ${time} | ${prRank} |`
        );
      }

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    }

    if (name === "get_activity_stats") {
      const { start_date, end_date } = args;
      const stats = await getActivityStats(start_date, end_date);

      const lines = [
        `## Activity Stats: ${start_date} to ${end_date}`,
        `**Total activities:** ${stats.totalActivities}`,
        "",
        "### By Activity Type",
        "",
      ];

      for (const [type, data] of Object.entries(stats.byType)) {
        const distanceMi = formatDistance(data.totalDistance);
        const time = formatDuration(data.totalTime);
        const elevationFt = Math.round(data.totalElevation * 3.28084);

        lines.push(`**${type}**: ${data.count} activities`);
        lines.push(`- Total distance: ${distanceMi} mi`);
        lines.push(`- Total time: ${time}`);
        if (data.totalElevation > 0) {
          lines.push(`- Total elevation: ${elevationFt} ft`);
        }
        lines.push("");
      }

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    }

    if (name === "get_activity_details") {
      const { activity_id } = args;
      const details = await fetchActivityDetails(activity_id);

      const lines = [
        `## Activity: ${details.name}`,
        `**Type:** ${details.type}`,
        `**Date:** ${details.start_date_local}`,
        `**Distance:** ${formatDistance(details.distance)} mi`,
        `**Time:** ${formatDuration(details.moving_time)}`,
        `**Elevation:** ${Math.round((details.total_elevation_gain || 0) * 3.28084)} ft`,
        "",
      ];

      if (details.segment_efforts && details.segment_efforts.length > 0) {
        lines.push("### Segment Efforts");
        lines.push("");
        lines.push("| Segment | Time | PR Rank |");
        lines.push("|---------|------|---------|");

        for (const effort of details.segment_efforts) {
          const time = formatDuration(effort.moving_time);
          const prRank = effort.pr_rank ? `#${effort.pr_rank}` : "-";
          lines.push(`| ${effort.segment.name} | ${time} | ${prRank} |`);
        }
      }

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
