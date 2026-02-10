"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Database, AlertCircle, CheckCircle } from "lucide-react";

interface ApiStats {
  totalCalls: number;
  cacheHits: number;
  apiCalls: number;
  failures: number;
  cacheHitRate: string;
  failureRate: string;
  lastError: string | null;
  lastErrorTime: string | null;
}

interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  maxSize: number;
  utilizationPercent: number;
  ttlMinutes: number;
}

interface StatsResponse {
  api: ApiStats;
  cache: CacheStats;
  health: {
    status: string;
    message: string;
  };
  timestamp: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchStats} className="w-full mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:bg-slate-950 py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
              System Statistics
            </h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Real-time monitoring of API performance
            </p>
          </div>
          <Button onClick={fetchStats} disabled={loading} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Health Status */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {stats.health.status === "healthy" ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Status: {stats.health.status.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stats.health.message}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.api.totalCalls}</div>
              <p className="text-xs text-muted-foreground">
                All analysis requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Database className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.api.cacheHitRate}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.api.cacheHits} cache hits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.api.apiCalls}
              </div>
              <p className="text-xs text-muted-foreground">
                Google Gemini API requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                parseFloat(stats.api.failureRate) > 10 ? "text-red-600" : "text-gray-900"
              }`}>
                {stats.api.failureRate}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.api.failures} failures
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cache Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cache Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cache Entries</p>
                <p className="text-2xl font-bold">
                  {stats.cache.validEntries} / {stats.cache.maxSize}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${stats.cache.utilizationPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.cache.utilizationPercent}% utilized
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Expired Entries</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.cache.expiredEntries}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting cleanup
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Cache TTL</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.cache.ttlMinutes} min
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Time to live per entry
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Information */}
        {stats.api.lastError && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Last Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-2">{stats.api.lastError}</p>
              {stats.api.lastErrorTime && (
                <p className="text-xs text-red-600">
                  Occurred at: {new Date(stats.api.lastErrorTime).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Cache Efficiency</p>
                  <p className="text-sm text-gray-600">
                    {parseFloat(stats.api.cacheHitRate) > 50
                      ? "Excellent cache performance! Most requests are served from cache."
                      : "Cache is warming up. Performance will improve with more requests."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {stats.api.failures === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">API Reliability</p>
                  <p className="text-sm text-gray-600">
                    {stats.api.failures === 0
                      ? "All API calls successful. System is operating normally."
                      : `${stats.api.failures} API failures detected. Retry logic is handling errors gracefully.`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Retry Mechanism</p>
                  <p className="text-sm text-gray-600">
                    Automatic retry with exponential backoff (3 attempts) ensures high reliability.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
