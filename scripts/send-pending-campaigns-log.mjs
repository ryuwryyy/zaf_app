/**
 * Runs the campaign sender with default log file logs/campaign-run.log
 * unless CAMPAIGN_LOG_FILE is already set.
 */
if (!process.env.CAMPAIGN_LOG_FILE?.trim()) {
  process.env.CAMPAIGN_LOG_FILE = 'logs/campaign-run.log';
}

await import('./send-pending-campaigns.mjs');
