/**
 * Web Worker for history search
 * Handles filtering, Fuse.js indexing, and searching off the main thread
 */

importScripts('js/fuse.min.js');

let fuseInstance = null;
let cachedHistory = null;
let lastFuseOptions = null;

/**
 * Highlight Fuse matches with marker characters
 */
function highlightString(string, start, end) {
  return string.substring(0, start) + '\v' + string.substring(start, end + 1) + '\b' + string.substring(end + 1);
}

/**
 * Process Fuse result matches and add highlighting markers
 */
function highlightResult(result) {
  var item = result.item;
  var highlighted = {};

  if (result.matches) {
    result.matches.forEach(function(match) {
      var formatted = item[match.key];

      // Highlight each of the matches
      match.indices.forEach(function(endpoints, i) {
        // Each previous match has added two characters
        var offset = i * 2;
        formatted = highlightString(formatted, endpoints[0] + offset, endpoints[1] + offset);
      });

      highlighted[match.key] = formatted;
    });
  }

  return highlighted;
}

/**
 * Format a Fuse result into the expected output format
 */
function formatResult(result) {
  var highlighted = highlightResult(result);
  return {
    title: highlighted.title || result.item.title,
    displayUrl: highlighted.url || result.item.url,
    url: result.item.url,
    id: result.item.id,
    // History items don't have these, but include for consistency
    groupId: result.item.groupId,
    windowId: result.item.windowId,
    pinned: result.item.pinned,
    favIconUrl: result.item.favIconUrl
  };
}

/**
 * Check if Fuse options have changed
 */
function fuseOptionsChanged(newOptions) {
  if (!lastFuseOptions) return true;
  return JSON.stringify(lastFuseOptions) !== JSON.stringify(newOptions);
}

self.onmessage = function(e) {
  var data = e.data;

  if (data.type === 'search') {
    var searchId = data.searchId;
    var history = data.history;
    var query = data.query;
    var filterRegex = data.filterRegex;
    var fuseOptions = data.fuseOptions;

    // If new history data provided, filter and re-index
    if (history !== null) {
      var regex = filterRegex ? new RegExp(filterRegex) : null;

      cachedHistory = history.filter(function(v) {
        return v.url && v.title && (!regex || !regex.test(v.url));
      });

      fuseInstance = new Fuse(cachedHistory, fuseOptions);
      lastFuseOptions = fuseOptions;
    } else if (fuseOptionsChanged(fuseOptions) && cachedHistory) {
      // Options changed but same history - rebuild index with new options
      fuseInstance = new Fuse(cachedHistory, fuseOptions);
      lastFuseOptions = fuseOptions;
    }

    // Perform search if we have a valid Fuse instance
    if (fuseInstance && query) {
      var rawResults = fuseInstance.search(query.trim());
      var results = rawResults.slice(0, 50).map(formatResult);

      self.postMessage({
        type: 'results',
        searchId: searchId,
        results: results
      });
    } else {
      // No results or not ready
      self.postMessage({
        type: 'results',
        searchId: searchId,
        results: []
      });
    }
  }
};
