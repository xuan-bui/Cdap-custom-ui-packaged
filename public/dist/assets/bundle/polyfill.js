var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

/*
 * Copyright © 2015 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * getTransformToElement
 * This function is deprecated in chrome 48. Dagre-D3 is using this function to
 * draw the edge connections.
 *
 * Dagre-D3 issue: https://github.com/cpettitt/dagre-d3/issues/202
 **/
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (toElement) {
  return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
}; // 'includes' function of String is not available in older version of chromium browsers.


if (!String.prototype.includes) {
  String.prototype.includes = function () {
    'use strict';

    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
} // 'assign' function of Object is not available in older version of chromium browsers.


if (typeof Object.assign !== 'function') {
  Object.assign = function (target) {
    'use strict';

    if (target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];

      if (source !== null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }

    return target;
  };
}
(function () {
  var enterModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.enterModule : undefined;
  enterModule && enterModule(module);
})();

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

/*
 * Copyright © 2016-2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
  Purpose: To generate absolute URLs to navigate between CDAP and Extensions (Hydrator & Tracker)
    as they are separate web apps with independent UI routing
  I/P: Context/Naviation object that has,
    - uiApp - cdap, hydrator or tracker
    - namespaceId, appId, entityType, entityId & runId to generate the complete URL if
      appropriate context is available.

  O/P: Absolute Url of the form:
    <protocol>//<host>/:uiApp/:namespaceId/apps/:appId/:entityType/:entityId/runs/:runId

  The absolute URL will be generated based on the available context.

  Note:
    This is attached to the window object as this needs to be used in both CDAP (react app) and
    in hydrator & tracker (angular apps). For now it is attached to window as its a pure function
    without any side effects. Moving forward once we have everything in react we should use this
    as a proper utility function in es6 module system.
*/
window.getAbsUIUrl = function () {
  var navigationObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _navigationObj$uiApp = navigationObj.uiApp,
      uiApp = _navigationObj$uiApp === void 0 ? 'cdap' : _navigationObj$uiApp,
      redirectUrl = navigationObj.redirectUrl,
      clientId = navigationObj.clientId,
      namespaceId = navigationObj.namespaceId,
      appId = navigationObj.appId,
      entityType = navigationObj.entityType,
      entityId = navigationObj.entityId,
      runId = navigationObj.runId;
  var baseUrl = "".concat(location.protocol, "//").concat(location.host, "/").concat(uiApp);

  if (uiApp === 'login') {
    baseUrl += "?";
  }

  if (redirectUrl) {
    baseUrl += "redirectUrl=".concat(encodeURIComponent(redirectUrl));
  }

  if (clientId) {
    baseUrl += "&clientId=".concat(clientId);
  }

  if (namespaceId) {
    baseUrl += "/ns/".concat(namespaceId);
  }

  if (appId) {
    baseUrl += "/apps/".concat(appId);
  }

  if (entityType && entityId) {
    baseUrl += "/".concat(entityType, "/").concat(entityId);
  }

  if (runId) {
    baseUrl += "/runs/".concat(runId);
  }

  return baseUrl;
};

function buildCustomUrl(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var queryParams = {};

  var _loop = function _loop(key) {
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
      return "continue";
    }

    var val = params[key];
    var regexp = new RegExp(':' + key + '(\\W|$)', 'g');

    if (regexp.test(url)) {
      url = url.replace(regexp, function (match, p1) {
        return val + p1;
      });
    } else {
      queryParams[key] = val;
    }
  };

  for (var key in params) {
    var _ret = _loop(key);

    if (_ret === "continue") continue;
  }

  url = addCustomQueryParams(url, queryParams);
  return url;
}

function addCustomQueryParams(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!params) {
    return url;
  }

  var parts = [];

  function forEachSorted(obj, iterator, context) {
    var keys = Object.keys(params).sort();
    keys.forEach(function (key) {
      iterator.call(context, obj[key], key);
    });
    return keys;
  }

  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
  }

  forEachSorted(params, function (value, key) {
    if (value === null || typeof value === 'undefined') {
      return;
    }

    if (!Array.isArray(value)) {
      value = [value];
    }

    value.forEach(function (v) {
      if (_typeof(v) === 'object' && v !== null) {
        if (value.toString() === '[object Date]') {
          v = v.toISOString();
        } else {
          v = JSON.stringify(v);
        }
      }

      parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
    });
  });

  if (parts.length > 0) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
  }

  return url;
}

window.getDataPrepUrl = function () {
  var navigationObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var stateName = navigationObj.stateName,
      stateParams = navigationObj.stateParams;
  var uiApp = 'cdap';
  var baseUrl = "".concat(location.protocol, "//").concat(location.host, "/").concat(uiApp, "/ns/:namespace");
  var stateToUrlMap = {
    connections: '/connections',
    workspaces: '/wrangler'
  };
  var url = baseUrl + stateToUrlMap[stateName || 'workspaces'];
  url = buildCustomUrl(url, stateParams);
  return url;
};

window.getTrackerUrl = function () {
  var navigationObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var stateName = navigationObj.stateName,
      stateParams = navigationObj.stateParams;
  var uiApp = 'metadata';
  var baseUrl = "".concat(location.protocol, "//").concat(location.host, "/").concat(uiApp, "/ns/:namespace");
  var stateToUrlMap = {
    tracker: '',
    'tracker.detail': '',
    'tracker.detail.entity': '/entity/:entityType/:entityId',
    'tracker.detail.entity.metadata': '/entity/:entityType/:entityId/metadata',
    'tracker.detail.entity.lineage': '/entity/:entityType/:entityId/lineage',
    'tracker.detail.entity.summary': '/entity/:entityType/:entityId/summary'
  };
  var url = baseUrl + stateToUrlMap[stateName || 'tracker'];
  url = buildCustomUrl(url, stateParams);
  return url;
};

window.getHydratorUrl = function () {
  var navigationObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var stateName = navigationObj.stateName,
      stateParams = navigationObj.stateParams;
  var uiApp = stateName === 'hydrator.list' ? 'cdap' : 'pipelines';
  var baseUrl = "".concat(location.protocol, "//").concat(location.host, "/").concat(uiApp, "/ns/:namespace");
  var stateToUrlMap = {
    hydrator: '',
    'hydrator.create': '/studio',
    'hydrator.detail': '/view/:pipelineId',
    'hydrator.list': '/pipelines'
  };
  var url = baseUrl + stateToUrlMap[stateName || 'pipelines'];
  url = buildCustomUrl(url, stateParams);
  return url;
};

window.getOldCDAPUrl = function () {
  var navigationObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var stateName = navigationObj.stateName,
      stateParams = navigationObj.stateParams;
  var uiApp = 'oldcdap';
  var baseUrl = "".concat(location.protocol, "//").concat(location.host, "/").concat(uiApp, "/ns/:namespace");
  var stateToUrlMap = {
    'datasets.detail.overview.status': '/datasets/:datasetId/overview/status',
    'datasets.detail.overview.explore': '/datasets/:datasetId/overview/explore',
    'streams.detail.overview.status': '/streams/:streamId/overview/status',
    'streams.detail.overview.explore': '/streams/:streamId/overview/explore',
    'apps.detail.overview.status': '/apps/:appId/overview/status',
    'apps.detail.overview.programs': '/apps/:appId/overview/programs',
    'mapreduce.detail': '/apps/:appId/programs/mapreduce/:programId/runs',
    'workflows.detail': '/apps/:appId/programs/workflows/:programId/runs',
    'workflows.detail.run': '/apps/:appId/programs/workflows/:programId/runs/:runId',
    'workers.detail': '/apps/:appId/programs/workers/:programId/runs',
    'workers.detail.run': '/apps/:appId/programs/workers/:programId/runs/:runId',
    'spark.detail': '/apps/:appId/programs/spark/:programId/runs',
    'spark.detail.run': '/apps/:appId/programs/spark/:programId/runs/:runId',
    'flows.detail': '/apps/:appId/programs/flows/:programId/runs',
    'services.detail': '/apps/:appId/programs/services/:programId/runs'
  };
  var url = baseUrl + stateToUrlMap[stateName || 'pipelines'];
  url = buildCustomUrl(url, stateParams);
  return url;
};

;

(function () {
  var reactHotLoader = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.default : undefined;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(buildCustomUrl, "buildCustomUrl", "/Users/admin/Documents/Source/Epam/cdap/cdap-ui/app/ui-utils/url-generator.js");
  reactHotLoader.register(addCustomQueryParams, "addCustomQueryParams", "/Users/admin/Documents/Source/Epam/cdap/cdap-ui/app/ui-utils/url-generator.js");
})();

;

(function () {
  var leaveModule = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal.leaveModule : undefined;
  leaveModule && leaveModule(module);
})();