/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { NewPackagePolicy } from '@kbn/fleet-plugin/common';
import { cloneDeep } from 'lodash';
import { throttlingFormatter } from './browser/formatters';
import { LegacyConfigKey } from '../constants/monitor_management';
import { replaceStringWithParams } from './formatting_utils';
import { syntheticsPolicyFormatters } from './formatters';
import { ConfigKey, DataStream, MonitorFields } from '../runtime_types';

export const PARAMS_KEYS_TO_SKIP = [
  'secrets',
  'fields',
  ConfigKey.LOCATIONS,
  ConfigKey.TLS_VERSION,
  ConfigKey.SOURCE_PROJECT_CONTENT,
  ConfigKey.SOURCE_INLINE,
];

export const formatSyntheticsPolicy = (
  newPolicy: NewPackagePolicy,
  monitorType: DataStream,
  config: Partial<
    MonitorFields & {
      location_name: string;
      location_id: string;
      'monitor.project.name': string;
      'monitor.project.id': string;
    }
  >,
  params: Record<string, string>,
  isLegacy?: boolean
) => {
  const configKeys = Object.keys(config) as ConfigKey[];

  const formattedPolicy = cloneDeep(newPolicy);

  const currentInput = formattedPolicy.inputs.find(
    (input) => input.type === `synthetics/${monitorType}`
  );
  const dataStream = currentInput?.streams.find(
    (stream) => stream.data_stream.dataset === monitorType
  );
  formattedPolicy.inputs.forEach((input) => (input.enabled = false));

  if (currentInput && dataStream) {
    // reset all data streams to enabled false
    formattedPolicy.inputs.forEach((input) => (input.enabled = false));
    // enable only the input type and data stream that matches the monitor type.
    currentInput.enabled = true;
    dataStream.enabled = true;
  }

  configKeys.forEach((key) => {
    const configItem = dataStream?.vars?.[key];
    if (configItem) {
      if (syntheticsPolicyFormatters[key]) {
        configItem.value = syntheticsPolicyFormatters[key]?.(config, key);
      } else if (key === ConfigKey.MONITOR_SOURCE_TYPE && isLegacy) {
        configItem.value = undefined;
      } else {
        configItem.value = config[key] === undefined || config[key] === null ? null : config[key];
      }
      if (!PARAMS_KEYS_TO_SKIP.includes(key)) {
        configItem.value = replaceStringWithParams(configItem.value, params);
      }
    }
  });

  // TODO: remove this once we remove legacy support
  const throttling = dataStream?.vars?.[LegacyConfigKey.THROTTLING_CONFIG];
  if (throttling) {
    throttling.value = throttlingFormatter?.(config, ConfigKey.THROTTLING_CONFIG);
  }

  return { formattedPolicy, hasDataStream: Boolean(dataStream), hasInput: Boolean(currentInput) };
};
