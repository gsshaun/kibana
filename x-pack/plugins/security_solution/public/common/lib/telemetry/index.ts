/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UiCounterMetricType } from '@kbn/analytics';
import { METRIC_TYPE } from '@kbn/analytics';

import type { SetupPlugins } from '../../../types';
import type { AlertWorkflowStatus } from '../../types';
export { telemetryMiddleware } from './middleware';

export { METRIC_TYPE };
export * from './telemetry_client';
export * from './telemetry_service';
export * from './types';

type TrackFn = (type: UiCounterMetricType, event: string | string[], count?: number) => void;

const noop = () => {};

let _track: TrackFn;

export const track: TrackFn = (type, event, count) => {
  try {
    _track(type, event, count);
  } catch (error) {
    // ignore failed tracking call
  }
};

export const initTelemetry = (
  { usageCollection }: Pick<SetupPlugins, 'usageCollection'>,
  appId: string
) => {
  _track = usageCollection?.reportUiCounter?.bind(null, appId) ?? noop;
};

export enum TELEMETRY_EVENT {
  // Detections
  SIEM_RULE_ENABLED = 'siem_rule_enabled',
  SIEM_RULE_DISABLED = 'siem_rule_disabled',
  CUSTOM_RULE_ENABLED = 'custom_rule_enabled',
  CUSTOM_RULE_DISABLED = 'custom_rule_disabled',
  // ML
  SIEM_JOB_ENABLED = 'siem_job_enabled',
  SIEM_JOB_DISABLED = 'siem_job_disabled',
  CUSTOM_JOB_ENABLED = 'custom_job_enabled',
  CUSTOM_JOB_DISABLED = 'custom_job_disabled',
  JOB_ENABLE_FAILURE = 'job_enable_failure',
  JOB_DISABLE_FAILURE = 'job_disable_failure',

  // Timeline
  TIMELINE_OPENED = 'open_timeline',
  TIMELINE_SAVED = 'timeline_saved',
  TIMELINE_NAMED = 'timeline_named',

  // UI Interactions
  TAB_CLICKED = 'tab_',

  // Landing pages
  LANDING_CARD = 'landing_card_',
  // Landing page - dashboard
  DASHBOARD = 'navigate_to_dashboard',
  CREATE_DASHBOARD = 'create_dashboard',

  // Breadcrumbs
  BREADCRUMB = 'breadcrumb_',
  LEGACY_NAVIGATION = 'legacy_navigation_',
}

export const getTelemetryEvent = {
  groupedAlertsTakeAction: ({
    tableId,
    groupNumber,
    status,
  }: {
    tableId: string;
    groupNumber: number;
    status: AlertWorkflowStatus;
  }) => `alerts_table_${tableId}_group-${groupNumber}_mark-${status}`,
};
