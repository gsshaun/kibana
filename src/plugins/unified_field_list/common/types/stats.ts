/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export interface BucketedAggregation<KeyType = string> {
  buckets: Array<{
    key: KeyType;
    count: number;
  }>;
}

export interface NumberSummary {
  minValue: number | null;
  maxValue: number | null;
}

export interface FieldStatsResponse<KeyType = unknown> {
  // Total count of documents
  totalDocuments?: number;
  // If sampled, the exact number of matching documents
  sampledDocuments?: number;
  // If sampled, the exact number of values sampled. Can be higher than documents
  // because Elasticsearch supports arrays for all fields
  sampledValues?: number;
  // Histogram and values are based on distinct values, not based on documents
  histogram?: BucketedAggregation<KeyType>;
  topValues?: BucketedAggregation<KeyType>;
  numberSummary?: NumberSummary;
}
