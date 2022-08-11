var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /main.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  console.time(PKG.name);
  angular.module(PKG.name, [angular.module(PKG.name + '.features', [PKG.name + '.feature.tracker']).name, angular.module(PKG.name + '.commons', [angular.module(PKG.name + '.services', ['ngAnimate', 'ngSanitize', 'ngResource', 'ngStorage', 'ui.router', 'ngCookies']).name, angular.module(PKG.name + '.filters', [PKG.name + '.services']).name, 'mgcrea.ngStrap.datepicker', 'mgcrea.ngStrap.timepicker', 'mgcrea.ngStrap.alert', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.dropdown', 'mgcrea.ngStrap.typeahead', 'mgcrea.ngStrap.select', 'mgcrea.ngStrap.collapse', // 'mgcrea.ngStrap.modal',
  'ui.bootstrap.modal', 'ui.bootstrap', 'mgcrea.ngStrap.modal', 'ncy-angular-breadcrumb', 'angularMoment', 'ui.ace', 'gridster', 'angular-cron-jobs', 'angularjs-dropdown-multiselect', 'hc.marked', 'ngFileSaver', 'infinite-scroll', 'react']).name, 'angular-loading-bar']).value('THROTTLE_MILLISECONDS', 1000) // throttle infinite scroll
  .run(["$rootScope", "$state", "$stateParams", function ($rootScope, $state, $stateParams) {
    // It's very handy to add references to $state and $stateParams to the $rootScope
    // so that you can access them from any scope within your applications.For example,
    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    // to active whenever 'contacts.list' or one of its decendents is active.
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams; // for debugging... or to trigger easter eggs?

    window.$go = $state.go;
  }]).run(function () {
    window.CaskCommon.ThemeHelper.applyTheme();
  }).run(["$rootScope", "MY_CONFIG", "myAuth", "MYAUTH_EVENT", function ($rootScope, MY_CONFIG, myAuth, MYAUTH_EVENT) {
    $rootScope.$on('$stateChangeStart', function () {
      if (MY_CONFIG.securityEnabled) {
        if (!myAuth.isAuthenticated()) {
          $rootScope.$broadcast(MYAUTH_EVENT.logoutSuccess);
        }
      }
    });
  }]).run(["$rootScope", "myHelpers", "MYAUTH_EVENT", function ($rootScope, myHelpers, MYAUTH_EVENT) {
    $rootScope.$on(MYAUTH_EVENT.logoutSuccess, function () {
      window.location.href = myHelpers.getAbsUIUrl({
        uiApp: 'login',
        redirectUrl: location.href,
        clientId: 'hydrator'
      });
    });
  }]).run(["myNamespace", function (myNamespace) {
    myNamespace.getList();
  }]).run(function () {
    window.CaskCommon.StatusFactory.startPollingForBackendStatus();
  }).config(["MyDataSourceProvider", function (MyDataSourceProvider) {
    MyDataSourceProvider.defaultInterval = 5;
  }]).config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).run(["$rootScope", function ($rootScope) {
    $rootScope.defaultPollInterval = 10000;
  }]).config(["$provide", function ($provide) {
    $provide.decorator('$http', ["$delegate", "MyCDAPDataSource", function ($delegate, MyCDAPDataSource) {
      function newHttp(config) {
        var promise, myDataSrc;

        if (config.options) {
          // Can/Should make use of my<whatever>Api service in another service.
          // So in that case the service will not have a scope. Hence the check
          if (config.params && config.params.scope && angular.isObject(config.params.scope)) {
            myDataSrc = MyCDAPDataSource(config.params.scope);
            delete config.params.scope;
          } else {
            myDataSrc = MyCDAPDataSource();
          } // We can use MyCDAPDataSource directly or through $resource'y way.
          // If we use $resource'y way then we need to make some changes to
          // the data we get for $resource.


          config.$isResource = true;

          switch (config.options.type) {
            case 'POLL':
              promise = myDataSrc.poll(config);
              break;

            case 'REQUEST':
              promise = myDataSrc.request(config);
              break;

            case 'POLL-STOP':
              promise = myDataSrc.stopPoll(config);
              break;
          }

          return promise;
        } else {
          return $delegate(config);
        }
      }

      newHttp.get = $delegate.get;
      newHttp["delete"] = $delegate["delete"];
      newHttp.save = $delegate.save;
      newHttp.query = $delegate.query;
      newHttp.remove = $delegate.remove;
      newHttp.post = $delegate.post;
      newHttp.put = $delegate.put;
      return newHttp;
    }]);
  }]).config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push(["$rootScope", "myHelpers", function ($rootScope, myHelpers) {
      return {
        'request': function request(config) {
          var extendConfig = {
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          };

          if ($rootScope.currentUser && !myHelpers.objectQuery(config, 'data', 'profile_view')) {
            config = angular.extend(config, extendConfig, {
              user: $rootScope.currentUser || null,
              headers: {
                'Content-Type': 'application/json'
              }
            }); // This check is added because of HdInsight gateway security.
            // If we set Authorization to null, it strips off their Auth token

            if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode()) {
              // Accessing stuff from $rootScope is bad. This is done as to resolve circular dependency.
              // $http <- myAuthPromise <- myAuth <- $http <- $templateFactory <- $view <- $state
              extendConfig.headers.Authorization = 'Bearer ' + $rootScope.currentUser.token;
            }
          }

          angular.extend(config, extendConfig);
          return config;
        }
      };
    }]);
  }]).config(["$alertProvider", function ($alertProvider) {
    angular.extend($alertProvider.defaults, {
      animation: 'am-fade-and-scale',
      container: '#alerts',
      duration: false
    });
  }]).config(["$uibTooltipProvider", function ($uibTooltipProvider) {
    $uibTooltipProvider.setTriggers({
      'customShow': 'customHide'
    });
  }]).config(["$compileProvider", function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    /* !! DISABLE DEBUG INFO !! */
  }]).config(["cfpLoadingBarProvider", function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }]).config(["caskThemeProvider", function (caskThemeProvider) {
    caskThemeProvider.setThemes(['cdap' // customized theme
    ]);
  }]).config(['markedProvider', function (markedProvider) {
    markedProvider.setOptions({
      gfm: true,
      tables: true
    });
  }])
  /**
   * BodyCtrl
   * attached to the <body> tag, mostly responsible for
   *  setting the className based events from $state and caskTheme
   */
  .controller('BodyCtrl', ["$scope", "$cookies", "$cookieStore", "caskTheme", "CASK_THEME_EVENT", "$rootScope", "$state", "$log", "MYSOCKET_EVENT", "MyCDAPDataSource", "MY_CONFIG", "MYAUTH_EVENT", "EventPipe", "myAuth", "$window", "myAlertOnValium", "myLoadingService", "myHelpers", function ($scope, $cookies, $cookieStore, caskTheme, CASK_THEME_EVENT, $rootScope, $state, $log, MYSOCKET_EVENT, MyCDAPDataSource, MY_CONFIG, MYAUTH_EVENT, EventPipe, myAuth, $window, myAlertOnValium, myLoadingService, myHelpers) {
    var _this = this;

    window.CaskCommon.CDAPHelpers.setupExperiments();
    var activeThemeClass = caskTheme.getClassName();
    var dataSource = new MyCDAPDataSource($scope);
    getVersion();
    this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    this.pageLevelError = null;
    this.apiError = false;
    var globalEvents = window.CaskCommon.globalEvents;
    this.eventEmitter.on(globalEvents.NONAMESPACE, function () {
      _this.pageLevelError = {
        errorCode: 403
      };
    });
    this.eventEmitter.on(globalEvents.PAGE_LEVEL_ERROR, function (error) {
      // If we already have no namespace error thrown it trumps all other 404s
      // and UI should show that the user does not have access to the namespace
      // instead of specific 404s which will be misleading.
      if (_this.pageLevelError && _this.pageLevelError.errorCode === 403) {
        return;
      }

      if (error.reset === true) {
        _this.pageLevelError = null;
      } else {
        _this.pageLevelError = myHelpers.handlePageLevelError(error);
      }
    });
    this.eventEmitter.on(globalEvents.API_ERROR, function (hasError) {
      if (_this.apiError !== hasError) {
        _this.apiError = true;
      }
    });
    $scope.copyrightYear = new Date().getFullYear();

    function getVersion() {
      dataSource.request({
        _cdapPath: '/version'
      }).then(function (res) {
        $scope.version = res.version;
        $rootScope.cdapVersion = $scope.version;
        window.CaskCommon.VersionStore.dispatch({
          type: window.CaskCommon.VersionActions.updateVersion,
          payload: {
            version: res.version
          }
        });
      });
    }

    $scope.$on(CASK_THEME_EVENT.changed, function (event, newClassName) {
      if (!event.defaultPrevented) {
        $scope.bodyClass = $scope.bodyClass.replace(activeThemeClass, newClassName);
        activeThemeClass = newClassName;
      }
    });
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
      var classes = [];

      if (toState.data && toState.data.bodyClass) {
        classes = [toState.data.bodyClass];
      } else {
        var parts = toState.name.split('.'),
            count = parts.length + 1;

        while (1 < count--) {
          classes.push('state-' + parts.slice(0, count).join('-'));
        }
      }

      if (toState.name !== fromState.name && myAlertOnValium.isAnAlertOpened()) {
        myAlertOnValium.destroy();
      }

      classes.push(activeThemeClass);
      $scope.bodyClass = classes.join(' ');
      /**
       *  This is to make sure that the sroll position goes back to the top when user
       *  change state. UI Router has this function ($anchorScroll), but for some
       *  reason it is not working.
       **/

      $window.scrollTo(0, 0);
    });
    EventPipe.on(MYSOCKET_EVENT.reconnected, function () {
      $log.log('[DataSource] reconnected');
      myLoadingService.hideLoadingIcon();
    });
    console.timeEnd(PKG.name);
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /CDAP_UI_CONFIG.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').constant('CDAP_UI_CONFIG', window.CDAP_UI_CONFIG);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /MY_CONFIG.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').constant('MY_CONFIG', window.CDAP_CONFIG);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /StatusMapper.js */

  /*
   * Copyright © 2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('MyStatusMapper', function () {
    return window.CaskCommon.StatusMapper;
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /alert.js */

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
  angular.module(PKG.name + '.services').service('myAlert', function () {
    var __list = [];

    function alert(item) {
      if (angular.isObject(item) && Object.keys(item).length) {
        if (__list.length > 0 && __list[0].content === item.content && __list[0].title === item.title) {
          __list[0].count++;
          __list[0].time = Date.now();
        } else {
          __list.unshift({
            content: item.content,
            title: item.title,
            time: Date.now(),
            count: 1
          });
        }
      }
    }

    alert['clear'] = function () {
      __list = [];
    };

    alert['isEmpty'] = function () {
      return __list.length === 0;
    };

    alert['getAlerts'] = function () {
      return __list;
    };

    alert['count'] = function () {
      return __list.length;
    };

    alert['remove'] = function (item) {
      __list.splice(__list.indexOf(item), 1);
    };

    return alert;
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /app-level-loading-service.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').service('myLoadingService', ["$q", "EventPipe", function ($q, EventPipe) {
    var deferred;

    this.showLoadingIcon = function () {
      if (deferred) {
        return deferred.promise;
      }

      deferred = $q.defer();
      EventPipe.emit('showLoadingIcon');
      deferred.resolve(true);
      return deferred.promise;
    };

    this.hideLoadingIcon = function () {
      if (!deferred) {
        return $q.when(true);
      }

      EventPipe.emit('hideLoadingIcon');
      deferred.resolve(true);
      deferred = null;
    };

    this.hideLoadingIconImmediate = function () {
      if (!deferred) {
        return $q.when(true);
      }

      EventPipe.emit('hideLoadingIcon.immediate');
      deferred.resolve(true);
      deferred = null;
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /app-uploader.js */

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
  angular.module(PKG.name + '.services').factory('myAppUploader', ["myFileUploader", "$state", "myAlertOnValium", function (myFileUploader, $state, myAlertOnValium) {
    function upload(files, namespace) {
      for (var i = 0; i < files.length; i++) {
        myFileUploader.upload({
          path: '/namespaces/' + ($state.params.namespace || namespace) + '/apps',
          file: files[i]
        }, {
          'Content-type': 'application/octet-stream'
        }).then(success, error);
      }

      function success() {
        $state.reload().then(function () {
          myAlertOnValium.show({
            type: 'success',
            content: 'Application has been successfully uploaded'
          });
        });
      } // Independent xhr request. Failure case will not be handled by $rootScope.


      function error(err) {
        myAlertOnValium.show({
          type: 'danger',
          title: 'Upload failed',
          content: err || ''
        });
      }
    }

    return {
      upload: upload
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /auth.js */

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
  var module = angular.module(PKG.name + '.services');
  /*
    inspired by https://medium.com/opinionated-angularjs/
      techniques-for-authentication-in-angularjs-applications-7bbf0346acec
   */

  module.constant('MYAUTH_EVENT', {
    loginSuccess: 'myauth-login-success',
    loginFailed: 'myauth-login-failed',
    logoutSuccess: 'myauth-logout-success',
    sessionTimeout: 'myauth-session-timeout',
    notAuthenticated: 'myauth-not-authenticated',
    notAuthorized: 'myauth-not-authorized'
  });
  module.constant('MYAUTH_ROLE', {
    all: '*',
    user: 'user',
    admin: 'admin'
  });
  module.service('myAuth', ["MYAUTH_EVENT", "MyAuthUser", "myAuthPromise", "$rootScope", "$localStorage", "$cookies", function myAuthService(MYAUTH_EVENT, MyAuthUser, myAuthPromise, $rootScope, $localStorage, $cookies) {
    /**
     * private method to sync the user everywhere
     */
    var persist = angular.bind(this, function (u) {
      this.currentUser = u;
      $rootScope.currentUser = u;
    });

    this.getUsername = function () {
      if (angular.isObject(this.currentUser)) {
        return this.currentUser.username;
      }

      return false;
    };
    /**
     * remembered
     * @return {object} credentials
     */


    this.remembered = function () {
      var r = $localStorage.remember;
      return angular.extend({
        remember: !!r
      }, r || {});
    };
    /**
     * logout
     */


    this.logout = function () {
      if (this.currentUser) {
        persist(null);
        $cookies.remove('CDAP_Auth_Token', {
          path: '/'
        });
        $cookies.remove('CDAP_Auth_User', {
          path: '/'
        });
        $rootScope.$broadcast(MYAUTH_EVENT.logoutSuccess);
      }
    };
    /**
     * is there someone here?
     * @return {Boolean}
     */


    this.isAuthenticated = function () {
      if (window.CaskCommon.CDAPHelpers.isAuthSetToProxyMode()) {
        return true;
      }

      if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode() && this.currentUser) {
        return !!this.currentUser;
      }

      return this.updateCredentialsFromCookie();
    };

    this.updateCredentialsFromCookie = function () {
      if ($cookies.get('CDAP_Auth_Token') && $cookies.get('CDAP_Auth_User')) {
        var user = new MyAuthUser({
          access_token: $cookies.get('CDAP_Auth_Token'),
          username: $cookies.get('CDAP_Auth_User')
        });
        persist(user);
        return !!this.currentUser;
      }
    };

    this.updateCredentialsFromCookie();
  }]);
  module.factory('myAuthPromise', ["MY_CONFIG", "$q", "$http", function myAuthPromiseFactory(MY_CONFIG, $q, $http) {
    return function myAuthPromise(credentials) {
      var deferred = $q.defer();

      if (MY_CONFIG.securityEnabled) {
        $http({
          url: '/login',
          method: 'POST',
          data: credentials
        }).success(function (data) {
          deferred.resolve(angular.extend(data, {
            username: credentials.username
          }));
        }).error(function (data, status) {
          deferred.reject({
            data: data,
            statusCode: status
          });
        });
      } else {
        console.warn('Security is disabled, logging in automatically');
        deferred.resolve({
          username: credentials.username
        });
      }

      return deferred.promise;
    };
  }]);
  module.factory('MyAuthUser', ["MYAUTH_ROLE", function MyAuthUserFactory(MYAUTH_ROLE) {
    /**
     * Constructor for currentUser data
     * @param {object} user data
     */
    function User(data) {
      this.token = data.access_token;
      this.username = data.username;
      this.role = MYAUTH_ROLE.user;

      if (data.username === 'admin') {
        this.role = MYAUTH_ROLE.admin;
      }
    }
    /**
     * do i haz one of given roles?
     * @param  {String|Array} authorizedRoles
     * @return {Boolean}
     */


    User.prototype.hasRole = function (authorizedRoles) {
      if (this.role === MYAUTH_ROLE.admin) {
        return true;
      }

      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }

      return authorizedRoles.indexOf(this.role) !== -1;
    };
    /**
     * Omits secure info (i.e. token) and gets object for use
     * in localstorage.
     * @return {Object} storage info.
     */


    User.prototype.storable = function () {
      return {
        username: this.username
      };
    };

    return User;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /chart-helpers.js */

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
  angular.module(PKG.name + '.services').factory('MyChartHelpers', ["myHelpers", "MyMetricsQueryHelper", function (myHelpers, MyMetricsQueryHelper) {
    function processData(queryResults, queryId, metricNames, metricResolution, isAggregate) {
      var metrics, metric, data, dataPt, result;
      var i, j;
      var tempMap = {};
      var tmpData = [];
      result = queryResults[queryId]; // metrics = this.metric.names;

      metrics = metricNames;

      for (i = 0; i < metrics.length; i++) {
        metric = metrics[i];
        tempMap[metric] = zeroFill(metricResolution, result);
      }

      for (i = 0; i < result.series.length; i++) {
        data = result.series[i].data;
        metric = result.series[i].metricName;

        for (j = 0; j < data.length; j++) {
          dataPt = data[j];
          tempMap[metric][dataPt.time] = dataPt.value;
        }
      }

      for (i = 0; i < metrics.length; i++) {
        var thisMetricData = tempMap[metrics[i]];

        if (isAggregate) {
          thisMetricData = MyMetricsQueryHelper.aggregate(thisMetricData, isAggregate);
        }

        tmpData.push(thisMetricData);
      } // this.data = tmpData;


      return tmpData;
    } // Compute resolution since back-end doesn't provide us the resolution when 'auto' is used


    function resolutionFromAuto(startTime, endTime) {
      var diff = endTime - startTime;

      if (diff <= 600) {
        return '1s';
      } else if (diff <= 36000) {
        return '1m';
      }

      return '1h';
    }

    function skipAmtFromResolution(resolution) {
      switch (resolution) {
        case '1h':
          return 60 * 60;

        case '1m':
          return 60;

        case '1s':
          return 1;

        default:
          // backend defaults to '1s'
          return 1;
      }
    }

    function zeroFill(resolution, result) {
      // interpolating (filling with zeros) the data since backend returns only metrics at specific time periods
      // instead of for the whole range. We have to interpolate the rest with 0s to draw the graph.
      if (resolution === 'auto') {
        resolution = resolutionFromAuto(result.startTime, result.endTime);
      }

      var skipAmt = skipAmtFromResolution(resolution);
      var startTime = MyMetricsQueryHelper.roundUpToNearest(result.startTime, skipAmt);
      var endTime = MyMetricsQueryHelper.roundDownToNearest(result.endTime, skipAmt);
      var tempMap = {};

      for (var j = startTime; j <= endTime; j += skipAmt) {
        tempMap[j] = 0;
      }

      return tempMap;
    }

    function c3ifyData(newVal, metrics, alias) {
      var columns, totals, metricNames, metricAlias, values, xCoords;

      if (angular.isObject(newVal) && newVal.length) {
        metricNames = metrics.names.map(function (metricName) {
          metricAlias = alias[metricName];

          if (metricAlias !== undefined) {
            metricName = metricAlias;
          }

          return metricName;
        }); // columns will be in the format: [ [metric1Name, v1, v2, v3, v4], [metric2Name, v1, v2, v3, v4], ... xCoords ]

        columns = [];
        newVal.forEach(function (value, index) {
          values = Object.keys(value).map(function (key) {
            return value[key];
          });
          values.unshift(metricNames[index]);
          columns.push(values);
        }); // x coordinates are expected in the format: ['x', ts1, ts2, ts3...]

        xCoords = Object.keys(newVal[0]);
        xCoords.unshift('x');
        columns.push(xCoords);
        totals = [];
        columns.forEach(function (column) {
          if (!column.length || column[0] === 'x') {
            return;
          }

          totals.push(column.reduce(function (prev, current, index) {
            if (index === 1) {
              return current;
            }

            return prev + current;
          }));
        }); // DO NOT change the format of this data without ensuring that whoever needs it is also changed!
        // Some examples: c3 charts, table widget.
        // $scope.chartData = {columns: columns, totals: totals, metricNames: metricNames, xCoords: xCoords};

        return {
          columns: columns,
          totals: totals,
          metricNames: metricNames,
          xCoords: xCoords
        };
      }
    }

    function convertDashboardToNewWidgets(dashboards) {
      if (angular.isArray(dashboards)) {
        dashboards.forEach(function (dashboard) {
          var widgets = [];
          dashboard.config.columns.forEach(function (column) {
            widgets = widgets.concat(column);
          });
          dashboard.config.columns = widgets;
          widgets.forEach(function (widget) {
            widget.settings = {};
            widget.settings.color = widget.color;
            widget.settings.isLive = widget.isLive;
            widget.settings.interval = widget.interval;
            widget.settings.aggregate = widget.aggregate;
          });
        });
      }

      return dashboards;
    }

    function formatTimeseries(aggregate, series, input, metric) {
      var processedData = processData(series, 'qid', metric.names, metric.resolution);
      processedData = c3ifyData(processedData, metric, metric.names);
      var data = processedData.columns[0].slice(1);
      var format = [];
      format.unshift(aggregate - data[data.length - 1]);

      for (var i = data.length - 2; i >= 0; i--) {
        format.unshift(format[0] - data[i]);
      }

      format.unshift(processedData.columns[0][0]);
      processedData.columns[0] = format;
      input.chartData = {
        x: 'x',
        columns: processedData.columns,
        keys: {
          x: 'x'
        }
      };
      input.max = Math.max.apply(Math, format.slice(1));
      return input;
    }

    return {
      formatTimeseries: formatTimeseries,
      processData: processData,
      resolutionFromAuto: resolutionFromAuto,
      skipAmtFromResolution: skipAmtFromResolution,
      zeroFill: zeroFill,
      c3ifyData: c3ifyData,
      convertDashboardToNewWidgets: convertDashboardToNewWidgets
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /constants.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').constant('GLOBALS', window.CaskCommon.GLOBALS).constant('PROGRAM_STATUSES', window.CaskCommon.PROGRAM_STATUSES);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /file-uploader.js */

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
  angular.module(PKG.name + '.services').factory('myFileUploader', ["$q", "$window", "cfpLoadingBar", "myAuth", "myAlert", function ($q, $window, cfpLoadingBar, myAuth, myAlert) {
    function upload(fileObj, header) {
      var deferred = $q.defer();
      var path, customHeaderNames, xhr; // If the authentication mode is MANAGED and if the current user doesn't exists then reject.

      if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode() && !myAuth.currentUser) {
        deferred.reject(400);
        myAlert({
          title: 'Must specify user: ',
          content: 'Could not find user.',
          type: 'danger'
        });
      } else {
        xhr = new $window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (e) {
          if (e.type === 'progress') {
            console.info('App Upload in progress');
          }
        });
        path = fileObj.path;
        xhr.open('POST', path, true);

        if (angular.isObject(header) && Object.keys(header).length > 0) {
          xhr.setRequestHeader('Content-type', header['Content-type']);
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

          if (angular.isObject(header.customHeader) && Object.keys(header.customHeader).length > 0) {
            customHeaderNames = Object.keys(header.customHeader);
            customHeaderNames.forEach(function (headerName) {
              xhr.setRequestHeader(headerName, header.customHeader[headerName]);
            });
          }
        }

        xhr.setRequestHeader('X-Archive-Name', fileObj.file.name);
        xhr.setRequestHeader('sessionToken', window.CaskCommon.SessionTokenStore.getState());

        if ($window.CDAP_CONFIG.securityEnabled && myAuth.currentUser.token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + myAuth.currentUser.token);
        }

        xhr.send(fileObj.file);
        cfpLoadingBar.start();

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status > 399) {
              deferred.reject(xhr.response);
            } else {
              deferred.resolve();
            }

            cfpLoadingBar.complete();
          }
        };
      }

      return deferred.promise;
    }

    return {
      upload: upload
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /helpers.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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

  /**
   * various utility functions
   */
  angular.module(PKG.name + '.services').factory('myHelpers', ["myCdapUrl", "$window", function (myCdapUrl, $window) {
    /**
     * set a property deep in an object
     * adapted from Y.namespace
     * http://yuilibrary.com/yui/docs/api/files/yui_js_yui.js.html#l1370
     * @param  {Object} obj object on which to set a value
     * @param  {String} key potentially nested jsonpath, eg "foo.bar.baz"
     * @param  {Mixed} val value to set at the key
     * @return {Object}     modified obj
     */
    function deepSet(obj, key, val) {
      var it = obj,
          j,
          d,
          m;

      if (key.indexOf('.') > -1) {
        d = key.split('.');
        m = d.length - 1;

        for (j = 0; j <= m; j++) {
          if (j !== m) {
            it[d[j]] = it[d[j]] || {};
            it = it[d[j]];
          } else {
            // last part
            it[d[m]] = val;
          }
        }
      } else {
        obj[key] = val;
      }

      return obj;
    }
    /* ----------------------------------------------------------------------- */

    /**
     * set a property deep in an object.
     * The difference of objectSetter compared to deepSet is that
     * objectSetter just need the nested path as an array instead of
     * string with '.'
     * @param {Object} obj object on which to set a value
     * @param {Array} arr array of the nested path, eg ['foo', 'bar', 'baz']
     * @param {Mixed} value  value to be set as the last path of arr
     */


    function objectSetter(obj, arr, value) {
      var it = obj;

      for (var i = 0; i < arr.length; i++) {
        if (i === arr.length - 1) {
          it[arr[i]] = value;
        } else {
          if (!it[arr[i]]) {
            it[arr[i]] = {};
          }

          it = it[arr[i]];
        }
      }
    }
    /* ----------------------------------------------------------------------- */

    /**
     * get to a property deep in an obj by jsonpath
     * @param  {Object} obj object to inspect
     * @param  {String} key jsonpath eg "foo.bar.baz"
     * @param  {Boolean} returns a copy when isCopy === true
     * @return {Mixed}     value at the
     */


    function deepGet(obj, key, isCopy) {
      var val = objectQuery.apply(null, [obj].concat(key.split('.')));
      return isCopy ? angular.copy(val) : val;
    }
    /* ----------------------------------------------------------------------- */

    /*
      Purpose: Query a json object or an array of json objects
      Return: Returns undefined if property is not defined(never set) and
              and a valid value (including null) if defined.
      Usage:
        var obj1 = [
          {
            p1: 'something',
            p2: {
              p21: 'angular',
              p22: 21,
              p23: {
                p231: 'ember',
                p232: null
              }
            },
            p3: 1296,
            p4: [1, 2, 3],
            p5: null
          },
          {
            p101: 'somethingelse'
          }
        ]
        1. query(obj1, 0, 'p1') => 'something'
        2. query(obj1, 0, 'p2', 'p22') => 21
        3. query(obj1, 0, 'p2', 'p32') => { p231: 'ember'}
        4. query(obj1, 0, 'notaproperty') => undefined
        5. query(obj1, 0, 'p2', 'p32', 'somethingelse') => undefined
        6. query(obj1, 1, 'p2', 'p32') => undefined
        7. query(obj1, 0, 'p2', 'p23', 'p232') => null
        8. query(obj1, 0, 'p5') => null
     */


    function objectQuery(obj) {
      if (!angular.isObject(obj)) {
        return null;
      }

      for (var i = 1; i < arguments.length; i++) {
        if (!angular.isObject(obj)) {
          return undefined;
        }

        obj = obj[arguments[i]];
      }

      return obj;
    }
    /* ----------------------------------------------------------------------- */


    function __generateConfig(isNsPath, method, type, path, isArray, customConfig) {
      var config = {
        method: method,
        options: {
          type: type
        }
      };

      if (isNsPath) {
        config.url = myCdapUrl.constructUrl({
          _cdapNsPath: path
        });
      } else {
        config.url = myCdapUrl.constructUrl({
          _cdapPath: path
        });
      }

      if (isArray) {
        config.isArray = true;
      }

      return angular.extend(config, customConfig || {});
    }
    /*
      Purpose: construct a resource config object for endpoints API services
    */


    function getConfigNs(method, type, path, isArray, customConfig) {
      return __generateConfig(true, method, type, path, isArray, customConfig);
    }

    function getConfig(method, type, path, isArray, customConfig) {
      return __generateConfig(false, method, type, path, isArray, customConfig);
    }
    /* ----------------------------------------------------------------------- */


    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    /* ----------------------------------------------------------------------- */


    function objHasMissingValues(obj) {
      var res = false;
      var keysWithMissingValue = [];

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && key.length !== 0 && (typeof obj[key] === 'undefined' || typeof obj[key] === 'string' && obj[key].length === 0 || obj[key] === null)) {
          res = true;
          keysWithMissingValue.push(key);
        }
      }

      return {
        res: res,
        keysWithMissingValue: keysWithMissingValue
      };
    }
    /* ----------------------------------------------------------------------- */


    function handlePageLevelError(error) {
      // This function parses receiveing error messages and converts it to a
      // format that page level error supports
      var message = null;
      var errorCode = null;

      if (error.data) {
        message = error.data;
      } else if (typeof error.response === 'string') {
        message = error.response;
      }

      if (error.statusCode) {
        errorCode = error.statusCode;
      } else {
        // If we don't know about the error type, showing a 500 level error
        errorCode = 500;
      }

      return {
        errorCode: errorCode,
        message: message
      };
    }

    function extractErrorMessage(errObj) {
      var errorMsg = objectQuery(errObj, 'data') || objectQuery(errObj, 'response') || errObj;

      if (typeof errorMsg !== 'string') {
        errorMsg = JSON.stringify(errorMsg);
      }

      return errorMsg;
    }

    return {
      deepSet: deepSet,
      objectSetter: objectSetter,
      deepGet: deepGet,
      objectQuery: objectQuery,
      getConfig: getConfig,
      getConfigNs: getConfigNs,
      getAbsUIUrl: $window.getAbsUIUrl,
      isNumeric: isNumeric,
      handlePageLevelError: handlePageLevelError,
      extractErrorMessage: extractErrorMessage,
      objHasMissingValues: objHasMissingValues
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-orderings.js */

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
  angular.module(PKG.name + '.services').service('MyOrderings', ["myLocalStorage", function (myLocalStorage) {
    var APP_KEY = 'appOrdering';
    var DATA_KEY = 'dataOrdering';
    myLocalStorage.get(APP_KEY).then(function (value) {
      if (typeof value === 'undefined') {
        this.appList = [];
      } else {
        this.appList = value;
      }
    }.bind(this));
    myLocalStorage.get(DATA_KEY).then(function (value) {
      if (typeof value === 'undefined') {
        this.dataList = [];
      } else {
        this.dataList = value;
      }
    }.bind(this));

    function typeClicked(arr, id, key) {
      // delay by 1000ms so that the order does not change on the same visit to the page.
      setTimeout(function () {
        var idx = arr.indexOf(id);

        if (idx !== -1) {
          arr.splice(idx, 1);
        }

        arr.unshift(id);
        myLocalStorage.set(key, arr);
      }, 1000);
    }

    this.appClicked = function (appName) {
      typeClicked(this.appList, appName, APP_KEY);
    };

    this.dataClicked = function (dataName) {
      typeClicked(this.dataList, dataName, DATA_KEY);
    };

    function typeOrdering(arr, el) {
      var idx = arr.indexOf(el.name);

      if (idx === -1) {
        return arr.length;
      }

      return idx;
    }

    this.appOrdering = function (app) {
      return typeOrdering(this.appList, app);
    }.bind(this);

    this.dataOrdering = function (data) {
      return typeOrdering(this.dataList, data);
    }.bind(this);
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /namespace.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').service('myNamespace', ["$q", "MyCDAPDataSource", "EventPipe", "$http", "$rootScope", "myAuth", "myHelpers", "$state", function myNamespace($q, MyCDAPDataSource, EventPipe, $http, $rootScope, myAuth, myHelpers, $state) {
    this.namespaceList = [];
    var data = new MyCDAPDataSource(),
        prom,
        queryInProgress = null;

    this.getList = function (force) {
      if (!force && this.namespaceList.length) {
        return $q.when(this.namespaceList);
      }

      if (!queryInProgress) {
        prom = $q.defer();
        queryInProgress = true;
        data.request({
          _cdapPath: '/namespaces',
          method: 'GET'
        }).then(function (res) {
          if (!res.length && !$state.includes('admin.**')) {
            $state.go('unauthorized');
          }

          this.namespaceList = res;
          EventPipe.emit('namespace.update');
          prom.resolve(res);
          queryInProgress = null;
        }.bind(this), function (err) {
          prom.reject(err);
          queryInProgress = null;
        });
      }

      return prom.promise;
    };

    this.getDisplayName = function (name) {
      var ns = this.namespaceList.filter(function (namespace) {
        return namespace.name === name;
      });
      return ns[0].name || name;
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /query-helper.js */

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
  angular.module(PKG.name + '.services').factory('MyMetricsQueryHelper', function () {
    // 'ns.default.app.foo' -> {'ns': 'default', 'app': 'foo'}
    // returns null if context argument is malformed (odd number of parts)
    function contextToTags(context) {
      var parts, tags, i, tagValue;

      if (context.length) {
        parts = context.split('.');
      } else {
        // For an empty context, we want no tags. Splitting it by '.' yields [""]
        parts = [];
      }

      if (parts.length % 2 !== 0) {
        // Metrics context must have even number of parts
        return null;
      }

      tags = {};

      for (i = 0; i < parts.length; i += 2) {
        // In context, '~' is used to represent '.'
        tagValue = parts[i + 1].replace(/~/g, '.');
        tags[parts[i]] = tagValue;
      }

      return tags;
    } // TODO: Need to figure out a way to pass url for a chart
    // that is part of the widget, which is not a metric.
    // Right now a chart and a metric is tied together and
    // it needs to be changed.


    function constructQuery(queryId, tags, metric, isTimeRange, groupBy) {
      var timeRange, retObj;
      timeRange = {
        'start': metric.startTime || 'now-60s',
        'end': metric.endTime || 'now'
      };

      if (metric.resolution) {
        timeRange.resolution = metric.resolution;
      }

      retObj = {};
      retObj[queryId] = {
        tags: tags,
        metrics: metric.names
      };
      groupBy = groupBy || [];

      if (groupBy.length) {
        retObj[queryId].groupBy = groupBy;
      }

      isTimeRange = isTimeRange !== false;

      if (isTimeRange) {
        retObj[queryId].timeRange = timeRange;
      }

      return retObj;
    }

    function roundUpToNearest(val, nearest) {
      return Math.ceil(val / nearest) * nearest;
    }

    function roundDownToNearest(val, nearest) {
      return Math.floor(val / nearest) * nearest;
    }

    function aggregate(inputMetrics, by) {
      // Given an object in the format: { ts1: value, ts2: value, ts3: value, ts4: value },
      // This will return an object in the same format, where each sequence of {by} timestamps will be summed up.
      // Not currently considering resolution of the metric values (It groups simply starting from the first timestamp),
      // as opposed to grouping into 5-minute interval.
      var aggregated = {};
      var timeValues = Object.keys(inputMetrics);
      var roundedDown = roundDownToNearest(timeValues.length, by);

      for (var i = 0; i < roundedDown; i += by) {
        var sum = 0;

        for (var j = 0; j < by; j++) {
          sum += inputMetrics[timeValues[i + j]];
        }

        aggregated[timeValues[i]] = sum;
      } // Add up remainder elements (in case number of elements in obj is not evenly divisible by {by}


      if (roundedDown < timeValues.length) {
        var finalKey = timeValues[roundedDown];
        aggregated[finalKey] = 0;

        for (i = roundedDown; i < timeValues.length; i++) {
          aggregated[finalKey] += inputMetrics[timeValues[i]];
        }
      }

      return aggregated;
    } // {name: k1, value: v1} -> 'k1.v2'


    function tagToContext(tag) {
      var key = tag.name.replace(/\./g, '~');
      var value = tag.value.replace(/\./g, '~');
      return key + '.' + value;
    } // { namespace: default, app: foo, flow: bar } -> 'tag=namespace:default&tag=app:foo&tag=flow:bar'


    function tagsToParams(tags) {
      var keys = Object.keys(tags);
      var queryParams = [];
      keys.forEach(function (key) {
        var value = tags[key];
        queryParams.push('tag=' + key + ':' + value);
      });
      return queryParams.join('&');
    }

    return {
      contextToTags: contextToTags,
      constructQuery: constructQuery,
      roundUpToNearest: roundUpToNearest,
      roundDownToNearest: roundDownToNearest,
      aggregate: aggregate,
      tagToContext: tagToContext,
      tagsToParams: tagsToParams
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /settings.js */

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
  angular.module(PKG.name + '.services').factory('mySettings', ["MyPersistentStorage", function (MyPersistentStorage) {
    return new MyPersistentStorage('user');
  }]).factory('MyPersistentStorage', ["$q", "MyCDAPDataSource", "myHelpers", "$rootScope", "MYAUTH_EVENT", function MyPersistentStorageFactory($q, MyCDAPDataSource, myHelpers, $rootScope, MYAUTH_EVENT) {
    var data = new MyCDAPDataSource();

    function MyPersistentStorage(type) {
      this.endpoint = '/configuration/' + type;
      this.headers = {
        'Content-Type': 'application/json'
      };

      if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode()) {
        $rootScope.$on(MYAUTH_EVENT.logoutSuccess, function () {
          this.data = [];
          delete this.headers['Authorization'];
        }.bind(this));
      } // our cache of the server-side data


      this.data = {}; // flag so we dont fire off multiple similar queries

      this.pending = null;
    }
    /**
     * set a preference
     * @param {string} key, can have a path like "foo.bar.baz"
     * @param {mixed} value
     * @return {promise} resolved with the response from server
     */


    MyPersistentStorage.prototype.set = function (key, value) {
      myHelpers.deepSet(this.data, key, value);

      if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode()) {
        this.headers['Authorization'] = $rootScope.currentUser.token ? 'Bearer ' + $rootScope.currentUser.token : null;
      }

      return data.request({
        method: 'PUT',
        _cdapPath: this.endpoint,
        headers: this.headers,
        body: this.data
      });
    };
    /**
     * retrieve a preference
     * @param {string} key
     * @param {boolean} force true to bypass cache
     * @return {promise} resolved with the value
     */


    MyPersistentStorage.prototype.get = function (key, force) {
      var val = myHelpers.deepGet(this.data, key, true);

      if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode()) {
        this.headers['Authorization'] = $rootScope.currentUser.token ? 'Bearer ' + $rootScope.currentUser.token : null;
      }

      if (!force && val) {
        return $q.when(val);
      }

      var self = this;

      if (this.pending) {
        var deferred = $q.defer();
        this.pending.promise.then(function () {
          deferred.resolve(myHelpers.deepGet(self.data, key, true));
        });
        return deferred.promise;
      }

      this.pending = $q.defer();
      data.request({
        method: 'GET',
        headers: this.headers,
        _cdapPath: this.endpoint
      }, function (res) {
        self.data = res.property;
        self.pending.resolve(myHelpers.deepGet(self.data, key, true));
      }, function () {
        self.pending = null;
      });
      var promise = this.pending.promise;
      promise["finally"](function () {
        self.pending = null;
      });
      return promise;
    };

    return MyPersistentStorage;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /storage.js */

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

  /**
   * MyBrowserStorage
   * replicates the MyPersistentStorage API
   *
   * makes it easy to promote state
   * from _session_ to _local_ to _remotely stored_
   */
  angular.module(PKG.name + '.services').factory('myLocalStorage', ["MyBrowserStorage", function (MyBrowserStorage) {
    return new MyBrowserStorage('local');
  }]).factory('mySessionStorage', ["MyBrowserStorage", function (MyBrowserStorage) {
    return new MyBrowserStorage('session');
  }]).factory('MyBrowserStorage', ["$q", "$localStorage", "$sessionStorage", "myHelpers", function MyBrowserStorageFactory($q, $localStorage, $sessionStorage, myHelpers) {
    function MyBrowserStorage(type) {
      this.type = type;
      this.data = type === 'local' ? $localStorage : $sessionStorage;
    }
    /**
     * set a value
     * @param {string} key, can have a path like "foo.bar.baz"
     * @param {mixed} value
     * @return {promise} resolved with the response from server
     */


    MyBrowserStorage.prototype.set = function (key, value) {
      if (this.type === 'local') {
        key = PKG.name + '.' + key;
      }

      return $q.when(myHelpers.deepSet(this.data, key, value));
    };
    /**
     * retrieve a value
     * @param {string} key
     * @return {promise} resolved with the value
     */


    MyBrowserStorage.prototype.get = function (key) {
      if (this.type === 'local') {
        key = PKG.name + '.' + key;
      }

      return $q.when(myHelpers.deepGet(this.data, key));
    };

    return MyBrowserStorage;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /alert-on-valium/alert-on-valium.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('myAlertOnValium', ["$alert", "$window", function ($alert, $window) {
    var isAnAlertOpened = false,
        alertObj;
    var SUCCESS_ALERT_DURATION = 3; // duration amount in seconds

    function show(obj) {
      if (alertObj) {
        alertObj.hide();
      }

      obj.duration = obj.type === window.CaskCommon.ALERT_STATUS.Success || obj.type === window.CaskCommon.ALERT_STATUS.Info ? SUCCESS_ALERT_DURATION : false;
      alertObj = $alert(obj);

      if (obj.templateUrl) {
        alertObj.$scope.templateScope = obj.templateScope;
      } // Scroll to top so that user doesn't miss an alert


      $window.scrollTo(0, 0);
    }

    function destroy() {
      alertObj.hide();
    }

    function getisAnAlertOpened() {
      return isAnAlertOpened;
    }

    return {
      show: show,
      isAnAlertOpened: getisAnAlertOpened,
      destroy: destroy
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /apps/my-apps-api.js */

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
  angular.module(PKG.name + '.services').factory('myAppsApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basePath = '/namespaces/:namespace/apps',
        listPath = basePath,
        detailPath = basePath + '/:appId';
    return $resource(url({
      _cdapPath: basePath
    }), {
      appId: '@appId'
    }, {
      "delete": myHelpers.getConfig('DELETE', 'REQUEST', detailPath),
      list: myHelpers.getConfig('GET', 'REQUEST', listPath, true),
      get: myHelpers.getConfig('GET', 'REQUEST', detailPath)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-dispatcher/dispatcher.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('CaskAngularDispatcher', ["uuid", function (uuid) {
    function Dispatcher() {
      if (!(this instanceof Dispatcher)) {
        return new Dispatcher();
      }

      this.events = {};
    }

    Dispatcher.prototype.register = function (event, cb) {
      var id = uuid.v4();

      if (!this.events[event]) {
        this.events[event] = {};
      }

      if (typeof cb === 'function') {
        this.events[event][id] = cb;
      } else {
        throw 'Invalid callback. A callback registered for an event has to be a function';
      }

      return id;
    };

    Dispatcher.prototype.dispatch = function (event) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (!this.events[event]) {
        return;
      }

      angular.forEach(this.events[event], function (callback) {
        callback.apply(null, args);
      });
    };

    Dispatcher.prototype.unregister = function (event, registeredId) {
      if (this.events[event] && this.events[event][registeredId]) {
        delete this.events[event][registeredId];
      }
    };

    return Dispatcher;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-eventpipe/eventpipe.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').service('EventPipe', function () {
    var events = {};

    this.on = function (event, cb) {
      if (!events[event]) {
        events[event] = [cb];
      } else {
        events[event].push(cb);
      }

      return function () {
        if (!events[event]) {
          return;
        }

        var index = events[event].indexOf(cb);

        if (index !== -1) {
          events[event].splice(index, 1);
        }
      };
    };

    this.emit = function (event) {
      var args = Array.prototype.slice.call(arguments, 1);

      if (!events[event]) {
        return;
      }

      for (var i = 0; i < events[event].length; i++) {
        events[event][i].apply(this, args);
      }
    };

    this.cancelEvent = function (event) {
      if (events[event]) {
        delete events[event];
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-observable-promise/observable-promise.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
    Purpose:
      TL;DR
      MyPromise is observable promise. Sounds very disturbing but this is the initial
      attempt at sockets + $resource in an angular app.
  
      Longer Version:
      We cannot use promise pattern in a socket environment as promises
      resolve only once. In the case of sockets we might want to 'poll' for a data
      and get updated as soon something has changed.
      MyPromise provides an interface simillar to a Promise (not $q) and accepts
      in addition to a function a second argument. If you create your promise to
      be an observable then the handlers are never erased and your callback/resolve
      handler will be called whenever the promise gets resolved.
  
      @param {function} which gets a 'resolve' and a 'reject' methods
      @param {boolean} is observable or not.
  
      PS: Inspired from
        - https://www.promisejs.org/implementing/
        - https://github.com/kriskowal/q/blob/v1/design/README.js
  */
  angular.module(PKG.name + '.services').provider('MyPromise', function () {
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var UPDATED = 3;

    function Promise(fn, isObservable) {
      var isObserve = isObservable; // store state which can be PENDING, FULFILLED or REJECTED

      var state = PENDING; // store value once FULFILLED or REJECTED

      var value = null; // store sucess & failure handlers

      var handlers = [];

      function fulfill(result) {
        state = FULFILLED;
        value = result;
        handlers.forEach(handle);

        if (!isObserve) {
          handlers = null;
        }
      }

      function reject(error) {
        state = REJECTED;
        value = error;
        handlers.forEach(handle);

        if (!isObserve) {
          handlers = null;
        }
      }

      function resolve(result) {
        try {
          var then = getThen(result);

          if (then) {
            doResolve(then.bind(result), resolve, reject);
            return;
          }

          fulfill(result);
        } catch (ex) {
          reject(ex);
        }
      }

      function handle(handler) {
        if (state === PENDING) {
          handlers.push(handler);
        } else {
          if ((state === FULFILLED || state === UPDATED) && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(value);

            if (isObserve) {
              state = UPDATED;
            }
          }

          if (state === REJECTED && typeof handler.onRejected === 'function') {
            handler.onRejected(value);
          }
        }
      }

      this.done = function (onFulfilled, onRejected) {
        handle({
          onFulfilled: onFulfilled,
          onRejected: onRejected
        });
      };

      this.then = function (onFulfilled, onRejected) {
        var self = this; // Return a new promise for chaining.

        return new Promise(function (resolve, reject) {
          return self.done(function (result) {
            if (typeof onFulfilled === 'function') {
              try {
                return resolve(onFulfilled(result));
              } catch (ex) {
                return reject(ex);
              }
            } else {
              return resolve(result);
            }
          }, function (error) {
            if (typeof onRejected === 'function') {
              try {
                return resolve(onRejected(error));
              } catch (ex) {
                return reject(ex);
              }
            } else {
              return reject(error);
            }
          });
        }, isObserve);
      };

      doResolve(fn, resolve, reject);

      function getThen(value) {
        var t = _typeof(value);

        if (value && (t === 'object' || t === 'function')) {
          var then = value.then;

          if (typeof then === 'function') {
            return then;
          }
        }

        return null;
      }
      /**
       * Take a potentially misbehaving resolver function and make sure
       * onFulfilled and onRejected are only called once.
       *
       * Makes no guarantees about asynchrony.
       *
       * @param {Function} fn A resolver function that may not be trusted
       * @param {Function} onFulfilled
       * @param {Function} onRejected
       */


      function doResolve(fn, onFulfilled, onRejected) {
        var done = false;

        try {
          fn(function (value) {
            if (!isObserve) {
              if (done) {
                return;
              }

              done = true;
            }

            onFulfilled(value);
          }, function (reason) {
            if (!isObserve) {
              if (done) {
                return;
              }

              done = true;
            }

            onRejected(reason);
          });
        } catch (ex) {
          if (done) {
            return;
          }

          done = true;
          onRejected(ex);
        }
      }
    }

    this.$get = function () {
      return Promise;
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-socket-datasource/datasource.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  var socketDataSource = angular.module(PKG.name + '.services');
  /**
    Example Usage:
     MyCDAPDataSource // usage in a controller:
     var dataSrc = new MyCDAPDataSource($scope);
     // polling a namespaced resource example:
    dataSrc.poll({
        method: 'GET',
        _cdapNsPath: '/foo/bar',
        interval: 5000 // in milliseconds.
      },
      function(result) {
        $scope.foo = result;
      }
    ); // will poll <host>:<port>/v3/namespaces/<currentNamespace>/foo/bar
     // posting to a systemwide resource:
    dataSrc.request({
        method: 'POST',
        _cdapPath: '/system/config',
        body: {
          foo: 'bar'
        }
      },
      function(result) {
        $scope.foo = result;
      }
    ); // will post to <host>:<port>/v3/system/config
    */

  socketDataSource.factory('uuid', ["$window", function ($window) {
    return $window.uuid;
  }]);
  socketDataSource.provider('MyDataSource', function () {
    this.defaultPollInterval = 10;

    this.$get = ["$rootScope", "caskWindowManager", "mySocket", "MYSOCKET_EVENT", "$q", "MyPromise", "uuid", "EventPipe", function ($rootScope, caskWindowManager, mySocket, MYSOCKET_EVENT, $q, MyPromise, uuid, EventPipe) {
      var CDAP_API_VERSION = 'v3'; // FIXME (CDAP-14836): Right now this is scattered across node and client. Need to consolidate this.

      var REQUEST_ORIGIN_ROUTER = 'ROUTER';
      var instances = {}; // keyed by scopeid

      function DataSource(scope) {
        var _this = this;

        scope = scope || $rootScope.$new();
        var id = scope.$id,
            self = this;

        if (instances[id]) {
          // Reuse the same instance if already created.
          return instances[id];
        }

        if (!(this instanceof DataSource)) {
          return new DataSource(scope);
        }

        instances[id] = self;
        this.scopeId = id;
        this.bindings = {};
        EventPipe.on(MYSOCKET_EVENT.message, function (data) {
          var hash;
          var isPoll;
          hash = data.resource.id;

          if (data.statusCode > 299 || data.warning) {
            if (self.bindings[hash]) {
              if (self.bindings[hash].errorCallback) {
                $rootScope.$apply(self.bindings[hash].errorCallback.bind(null, data.error || data.response));
              } else if (self.bindings[hash].reject) {
                $rootScope.$apply(self.bindings[hash].reject.bind(null, {
                  data: data.error || data.response,
                  statusCode: data.statusCode
                }));
              }
            }
          } else if (self.bindings[hash]) {
            if (self.bindings[hash].callback) {
              data.response = data.response || {};
              data.response.__pollId__ = hash;
              scope.$apply(self.bindings[hash].callback.bind(null, data.response));
            } else if (self.bindings[hash].resolve) {
              // https://github.com/angular/angular.js/wiki/When-to-use-$scope.$apply%28%29
              scope.$apply(self.bindings[hash].resolve.bind(null, {
                data: data.response,
                id: hash,
                statusCode: data.statusCode
              }));
            }
            /*
              At first glance this condition check might be redundant with line 157,
              however in the resolve or callback function if the user initiates a stop-poll call then
              the execution goes to stopPoll function in line 264 and there we delete the entry from bindings
              as we no longer need it. After the stopPoll request has gone out the execution continues back
              here and we can do self.bindings[hash].poll as self.bindings[hash] is already deleted in stopPoll.
            */


            if (!self.bindings[hash]) {
              return;
            }

            isPoll = self.bindings[hash].poll;

            if (!isPoll) {
              // We can remove the entry from the self bindings if its not a poll.
              // Is not going to be used for anything else.
              delete self.bindings[hash];
            } else {
              if (self.bindings[hash] && self.bindings[hash].type === 'POLL') {
                self.bindings[hash].resource.interval = startClientPoll(hash, self.bindings, self.bindings[hash].resource.intervalTime);
              }
            }
          }

          return;
        });
        EventPipe.on(MYSOCKET_EVENT.reconnected, function () {
          Object.keys(_this.bindings).forEach(function (reqId) {
            var req = self.bindings[reqId];

            if (req.poll) {
              pausePoll(self.bindings);
            }

            mySocket.send({
              action: 'request',
              resource: req.resource
            });
          });
        });
        EventPipe.on(MYSOCKET_EVENT.closed, function () {
          pausePoll(self.bindings);
        });
        scope.$on('$destroy', function () {
          Object.keys(self.bindings).forEach(function (key) {
            var b = self.bindings[key];

            if (b.poll) {
              stopPoll(self.bindings, b.resource.id);
            }
          });
          delete instances[self.scopeId];
        });
        scope.$on(caskWindowManager.event.blur, function () {
          pausePoll(self.bindings);
        });
        scope.$on(caskWindowManager.event.focus, function () {
          resumePoll(self.bindings);
        });
      }

      function startClientPoll(resourceId, bindings, interval) {
        var intervalTimer = setTimeout(function () {
          var resource = bindings[resourceId] ? bindings[resourceId].resource : undefined;

          if (!resource) {
            clearTimeout(intervalTimer);
            return;
          }

          mySocket.send({
            action: 'request',
            resource: resource
          });
        }, interval);
        return intervalTimer;
      }

      function stopPoll(bindings, resourceId) {
        var id;

        if (_typeof(resourceId) === 'object' && resourceId !== null) {
          id = resourceId.params.pollId;
        } else {
          id = resourceId;
        }

        if (bindings[id]) {
          clearTimeout(bindings[id].resource.interval);
          delete bindings[id];
        }
      }

      function pausePoll(bindings) {
        Object.keys(bindings).filter(function (resourceId) {
          return bindings[resourceId].type === 'POLL';
        }).forEach(function (resourceId) {
          clearTimeout(bindings[resourceId].resource.interval);
        });
      }

      function resumePoll(bindings) {
        Object.keys(bindings).filter(function (resourceId) {
          return bindings[resourceId].type === 'POLL';
        }).forEach(function (resourceId) {
          bindings[resourceId].resource.interval = startClientPoll(resourceId, bindings, bindings[resourceId].resource);
        });
      }
      /**
       * Start polling of a resource when in scope.
       */


      DataSource.prototype.poll = function (resource, cb, errorCb) {
        var self = this;
        var generatedResource = {};
        var intervalTime = resource.interval || resource.options && resource.options.interval || $rootScope.defaultPollInterval;
        var promise = new MyPromise(function (resolve, reject) {
          var resourceId = uuid.v4();
          generatedResource = {
            id: resourceId,
            json: resource.json,
            intervalTime: intervalTime,
            interval: startClientPoll(resourceId, self.bindings, intervalTime),
            body: resource.body,
            method: resource.method || 'GET',
            suppressErrors: resource.suppressErrors || false
          };

          if (resource.headers) {
            generatedResource.headers = resource.headers;
          }

          var apiVersion = resource.apiVersion || CDAP_API_VERSION;

          if (!resource.requestOrigin || resource.requestOrigin === REQUEST_ORIGIN_ROUTER) {
            resource.url = "/".concat(apiVersion).concat(resource.url);
          }

          if (resource.requestOrigin) {
            generatedResource.requestOrigin = resource.requestOrigin;
          } else {
            generatedResource.requestOrigin = REQUEST_ORIGIN_ROUTER;
          }

          generatedResource.url = buildUrl(resource.url, resource.params || {});
          self.bindings[generatedResource.id] = {
            poll: true,
            type: 'POLL',
            callback: cb,
            resource: generatedResource,
            errorCallback: errorCb,
            resolve: resolve,
            reject: reject
          };
          mySocket.send({
            action: 'request',
            resource: generatedResource
          });
        }, true);

        if (!resource.$isResource) {
          promise = promise.then(function (res) {
            res = res.data;
            res.__pollId__ = generatedResource.id;
            return $q.when(res);
          });
        }

        promise.__pollId__ = generatedResource.id;
        return promise;
      };
      /**
       * Stop polling of a resource when requested.
       * (when scope is destroyed Line 196 takes care of deleting the polling resource)
       */


      DataSource.prototype.stopPoll = function (resourceId) {
        // Duck Typing for angular's $resource.
        var defer = $q.defer();
        var id, resource;

        if (angular.isObject(resourceId)) {
          id = resourceId.params.pollId;
        } else {
          id = resourceId;
        }

        var match = this.bindings[resourceId];

        if (match) {
          resource = match.resource;
          stopPoll(this.bindings, resourceId);
          defer.resolve({});
        } else {
          defer.reject({});
        }

        return defer.promise;
      };
      /**
       * Fetch a template configuration on-demand. Send the action
       * 'template-config' to the node backend.
       */


      DataSource.prototype.config = function (resource, cb, errorCb) {
        var deferred = $q.defer();
        resource.suppressErrors = true;
        resource.id = uuid.v4();
        this.bindings[resource.id] = {
          resource: resource,
          callback: function callback(result) {
            if (cb) {
              cb.apply(null, result);
            }

            deferred.resolve(result);
          },
          errorCallback: function errorCallback(err) {
            if (errorCb) {
              errorCb.apply(null, err);
            }

            deferred.reject(err);
          }
        };
        mySocket.send({
          action: resource.actionName,
          resource: resource
        });
        return deferred.promise;
      };
      /**
       * Fetch a resource on-demand. Send the action 'request' to
       * the node backend.
       */


      DataSource.prototype.request = function (resource, cb, errorCb) {
        var self = this;
        var promise = new MyPromise(function (resolve, reject) {
          var generatedResource = {
            json: resource.json,
            method: resource.method || 'GET',
            suppressErrors: resource.suppressErrors || false
          };

          if (resource.body) {
            generatedResource.body = resource.body;
          }

          if (resource.data) {
            generatedResource.body = resource.data;
          }

          if (resource.headers) {
            generatedResource.headers = resource.headers;
          }

          if (resource.contentType) {
            generatedResource.headers['Content-Type'] = resource.contentType;
          }

          var apiVersion = resource.apiVersion || CDAP_API_VERSION;

          if (!resource.requestOrigin || resource.requestOrigin === REQUEST_ORIGIN_ROUTER) {
            resource.url = "/".concat(apiVersion).concat(resource.url);
          }

          if (resource.requestOrigin) {
            generatedResource.requestOrigin = resource.requestOrigin;
          } else {
            generatedResource.requestOrigin = REQUEST_ORIGIN_ROUTER;
          }

          generatedResource.url = buildUrl(resource.url, resource.params || {});
          generatedResource.id = uuid.v4();
          self.bindings[generatedResource.id] = {
            type: 'REQUEST',
            callback: cb,
            errorCallback: errorCb,
            resource: generatedResource,
            resolve: resolve,
            reject: reject
          };
          mySocket.send({
            action: 'request',
            resource: generatedResource
          });
        }, false);

        if (!resource.$isResource) {
          promise = promise.then(function (res) {
            res = res.data;
            return $q.when(res);
          });
        }

        return promise;
      };

      return DataSource;
    }];
  }); // Lifted from $http as a helper method to parse '@params' in the url for $resource.

  function buildUrl(url, params) {
    if (!params) {
      return url;
    }

    var parts = [];

    function forEachSorted(obj, iterator, context) {
      var keys = Object.keys(params).sort();

      for (var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
      }

      return keys;
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
      return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
    }

    forEachSorted(params, function (value, key) {
      if (value === null || angular.isUndefined(value)) {
        return;
      }

      if (!angular.isArray(value)) {
        value = [value];
      }

      angular.forEach(value, function (v) {
        if (angular.isObject(v)) {
          if (angular.isDate(v)) {
            v = v.toISOString();
          } else {
            v = angular.toJson(v);
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
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-socket-datasource/socket.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('SockJS', ["$window", function ($window) {
    return $window.SockJS;
  }]).constant('MYSOCKET_EVENT', {
    message: 'mysocket-message',
    closed: 'mysocket-closed',
    reconnected: 'mysocket-reconnected'
  }).provider('mySocket', function () {
    this.prefix = '/_sock';

    this.$get = ["MYSOCKET_EVENT", "SockJS", "$log", "EventPipe", function (MYSOCKET_EVENT, SockJS, $log, EventPipe) {
      var self = this,
          socket = null,
          buffer = [],
          firstTime = true;

      function init(attempt) {
        $log.log('[mySocket] init');
        attempt = attempt || 1;
        socket = new SockJS(self.prefix);

        socket.onmessage = function (event) {
          try {
            var data = JSON.parse(event.data);
            $log.debug('[mySocket] ←', data);
            EventPipe.emit(MYSOCKET_EVENT.message, data);
          } catch (e) {
            $log.error(e);
          }
        };

        socket.onopen = function () {
          if (!firstTime) {
            window.CaskCommon.SessionTokenStore.fetchSessionToken().then(function () {
              EventPipe.emit(MYSOCKET_EVENT.reconnected);
              attempt = 1;
            }, function () {
              console.log('Failed to fetch session token');
            });
          }

          firstTime = false;
          $log.info('[mySocket] opened');
          angular.forEach(buffer, send);
          buffer = [];
        };

        socket.onclose = function (event) {
          $log.error(event.reason);
          EventPipe.emit('backendDown', 'User interface service is down');

          if (attempt < 2) {
            EventPipe.emit(MYSOCKET_EVENT.closed, event);
          } // reconnect with exponential backoff


          var d = Math.max(500, Math.round((Math.random() + 1) * 500 * Math.pow(2, attempt)));
          $log.log('[mySocket] will try again in ', d + 'ms');
          setTimeout(function () {
            init(attempt + 1);
          }, d);
        };
      }

      function send(obj) {
        if (!socket.readyState) {
          buffer.push(obj);
          return false;
        }

        doSend(obj);
        return true;
      }

      function doSend(obj) {
        var msg = obj,
            r = obj.resource;

        if (r) {
          msg.resource = r; // Majority of the time, we send data as json and expect a json response, but not always (i.e. stream ingest).
          // Default to json content-type.

          if (msg.resource.json === undefined) {
            msg.resource.json = true;
          }

          if (!r.method) {
            msg.resource.method = 'GET';
          }

          $log.debug('[mySocket] →', msg.action, r.method, r.url);
        }

        msg.sessionToken = window.CaskCommon.SessionTokenStore["default"].getState();
        socket.send(JSON.stringify(msg));
      }

      init();
      return {
        init: init,
        send: send,
        close: function close() {
          return socket.close.apply(socket, arguments);
        }
      };
    }];
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-theme/theme.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskTheme
   */
  angular.module(PKG.name + '.services').constant('CASK_THEME_EVENT', {
    changed: 'cask-theme-changed'
  }).provider('caskTheme', function CaskThemeProvider() {
    var THEME_LIST = ['default'];

    this.setThemes = function (t) {
      if (angular.isArray(t) && t.length) {
        THEME_LIST = t;
      }
    };

    this.$get = ["$localStorage", "$rootScope", "CASK_THEME_EVENT", function ($localStorage, $rootScope, CASK_THEME_EVENT) {
      function Factory() {
        this.current = $localStorage.theme || THEME_LIST[0];

        this.set = function (theme) {
          if (THEME_LIST.indexOf(theme) !== -1) {
            this.current = theme;
            $localStorage.theme = theme;
            $rootScope.$broadcast(CASK_THEME_EVENT.changed, this.getClassName());
          }
        };

        this.list = function () {
          return THEME_LIST;
        };

        this.getClassName = function () {
          return 'theme-' + this.current;
        };
      }

      return new Factory();
    }];
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-window-manager/wm.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').constant('CASK_WM_EVENT', {
    resize: 'cask-wm-resize',
    blur: 'cask-wm-blur',
    focus: 'cask-wm-focus'
  }).provider('caskWindowManager', ["CASK_WM_EVENT", function (CASK_WM_EVENT) {
    this.resizeDebounceMs = 500;
    this.pageViz = {
      hidden: 'visibilitychange',
      mozHidden: 'mozvisibilitychange',
      msHidden: 'msvisibilitychange',
      webkitHidden: 'webkitvisibilitychange'
    };

    this.$get = ["$rootScope", "$window", "$document", "$log", "$timeout", function ($rootScope, $window, $document, $log, $timeout) {
      // resize inspired by https://github.com/danmasta/ngResize
      var resizeDebounceMs = this.resizeDebounceMs,
          resizePromise = null;
      angular.element($window).on('resize', function () {
        if (resizePromise) {
          $timeout.cancel(resizePromise);
        }

        resizePromise = $timeout(function () {
          $log.log('[caskWindowManager]', 'resize');
          $rootScope.$broadcast(CASK_WM_EVENT.resize, {
            width: $window.innerWidth,
            height: $window.innerHeight
          });
        }, resizeDebounceMs, false);
      }); // pageviz inspired by https://github.com/mz026/angular_page_visibility

      var mkOnVizChange = function mkOnVizChange(q) {
        return function (e) {
          $log.log('[caskWindowManager]', e);
          $rootScope.$broadcast(CASK_WM_EVENT[$document.prop(q) ? 'blur' : 'focus']);
        };
      };

      var vizImp = Object.keys(this.pageViz);

      for (var i = 0; i < vizImp.length; i++) {
        // iterate through implementations
        var p = vizImp[i];

        if (typeof $document.prop(p) !== 'undefined') {
          $log.info('[caskWindowManager] page visibility API available!');
          $document.on(this.pageViz[p], mkOnVizChange(p));
          break;
        }
      }

      return {
        event: CASK_WM_EVENT
      };
    }];
  }])
  /*
  * caskOnWm Directive
  *
  * usage: cask-on-wm="{resize:expression()}"
  * event data is available as $event
  */
  .directive('caskOnWm', ["$parse", "$timeout", "caskWindowManager", function ($parse, $timeout, caskWindowManager) {
    return {
      compile: function compile($element, attr) {
        var obj = $parse(attr.caskOnWm);
        return function (scope) {
          angular.forEach(obj, function (fn, key) {
            var eName = caskWindowManager.event[key];

            if (eName) {
              scope.$on(eName, function (event, data) {
                $timeout(function () {
                  scope.$apply(function () {
                    fn(scope, {
                      $event: data
                    });
                  });
                });
              });
            }
          });
        };
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /dashboard/dashboardhelper.js */

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
  angular.module(PKG.name + '.services').factory('DashboardHelper', ["MyCDAPDataSource", "MyChartHelpers", "MyMetricsQueryHelper", function (MyCDAPDataSource, MyChartHelpers, MyMetricsQueryHelper) {
    var dataSrc = new MyCDAPDataSource();

    function startPolling(widget) {
      widget.pollId = dataSrc.poll({
        _cdapPath: '/metrics/query',
        method: 'POST',
        interval: widget.settings.interval,
        body: MyMetricsQueryHelper.constructQuery('qid', MyMetricsQueryHelper.contextToTags(widget.metric.context), widget.metric)
      }, function (res) {
        widget.formattedData = formatData(res, widget);
      }).__pollId__;
    }

    function stopPolling(widget) {
      dataSrc.stopPoll(widget.pollId);
    }

    function startPollDashboard(dashboard) {
      angular.forEach(dashboard.columns, function (widget) {
        startPolling(widget);
      });
    }

    function stopPollDashboard(dashboard) {
      angular.forEach(dashboard.columns, function (widget) {
        stopPolling(widget);
      });
    }

    function fetchData(widget) {
      return dataSrc.request({
        _cdapPath: '/metrics/query',
        method: 'POST',
        body: MyMetricsQueryHelper.constructQuery('qid', MyMetricsQueryHelper.contextToTags(widget.metric.context), widget.metric)
      }).then(function (res) {
        widget.formattedData = formatData(res, widget);
      });
    }

    function pollData(widget) {
      return dataSrc.poll({
        _cdapPath: '/metrics/query',
        method: 'POST',
        body: MyMetricsQueryHelper.constructQuery('qid', MyMetricsQueryHelper.contextToTags(widget.metric.context), widget.metric)
      }).then(function (res) {
        widget.formattedData = formatData(res, widget);
      });
    }

    function fetchDataDashboard(dashboard) {
      angular.forEach(dashboard.columns, function (widget) {
        fetchData(widget);
      });
    }

    function formatData(res, widget) {
      var processedData = MyChartHelpers.processData(res, 'qid', widget.metric.names, widget.metric.resolution, widget.settings.aggregate);
      processedData = MyChartHelpers.c3ifyData(processedData, widget.metric, widget.metricAlias);
      var data = {
        x: 'x',
        columns: processedData.columns,
        keys: {
          x: 'x'
        }
      };
      return data;
    }

    return {
      startPolling: startPolling,
      stopPolling: stopPolling,
      startPollDashboard: startPollDashboard,
      stopPollDashboard: stopPollDashboard,
      fetchData: fetchData,
      pollData: pollData,
      fetchDataDashboard: fetchDataDashboard
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /data/cdap-url.js */

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
  angular.module(PKG.name + '.services').factory('myCdapUrl', ["$stateParams", function myCdapUrl($stateParams) {
    function constructUrl(resource) {
      var url;

      if (resource._cdapNsPath) {
        var namespace = $stateParams.namespace;

        if (!namespace) {
          throw new Error('_cdapNsPath requires $stateParams.namespace to be defined');
        }

        resource._cdapPath = ['/namespaces/', namespace, resource._cdapNsPath].join('');
        delete resource._cdapNsPath;
      } // further sugar for building absolute url


      if (resource._cdapPath) {
        url = resource._cdapPath;
        delete resource._cdapPath;
      }

      return url;
    }

    return {
      constructUrl: constructUrl
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /data/my-cdap-datasource.js */

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
  angular.module(PKG.name + '.services').factory('MyCDAPDataSource', ["MyDataSource", "$rootScope", "myCdapUrl", "$cookies", function (MyDataSource, $rootScope, myCdapUrl, $cookies) {
    function MyCDAPDataSource(scope) {
      scope = scope || $rootScope.$new();

      if (!(this instanceof MyCDAPDataSource)) {
        return new MyCDAPDataSource(scope);
      }

      this.MyDataSource = new MyDataSource(scope);
    }

    MyCDAPDataSource.prototype.poll = function (resource, cb, errorCb) {
      // FIXME: There is a circular dependency and that is why
      // myAuth.isAuthenticated is not used. There should be a better way to do this.
      if (window.CDAP_CONFIG.securityEnabled && $cookies.get('CDAP_Auth_Token')) {
        resource.headers = {
          Authorization: 'Bearer ' + $cookies.get('CDAP_Auth_Token')
        };
      } else if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode() && $rootScope.currentUser && $rootScope.currentUser.token) {
        resource.headers = {
          Authorization: 'Bearer ' + $rootScope.currentUser.token
        };
      } else {
        resource.headers = {};
      }

      if (!resource.url) {
        resource.url = myCdapUrl.constructUrl(resource);
      }

      return this.MyDataSource.poll(resource, cb, errorCb);
    };

    MyCDAPDataSource.prototype.stopPoll = function (resourceId) {
      return this.MyDataSource.stopPoll(resourceId);
    };

    MyCDAPDataSource.prototype.config = function (resource, cb, errorCb) {
      resource.actionName = 'template-config';
      return this.MyDataSource.config(resource, cb, errorCb);
    };

    MyCDAPDataSource.prototype.request = function (resource, cb, errorCb) {
      if (window.CDAP_CONFIG.securityEnabled && $cookies.get('CDAP_Auth_Token')) {
        resource.headers = {
          Authorization: 'Bearer ' + $cookies.get('CDAP_Auth_Token')
        };
      } else if (window.CaskCommon.CDAPHelpers.isAuthSetToManagedMode() && $rootScope.currentUser && $rootScope.currentUser.token) {
        resource.headers = {
          Authorization: 'Bearer ' + $rootScope.currentUser.token
        };
      } else {
        resource.headers = {};
      }

      if (!resource.url) {
        resource.url = myCdapUrl.constructUrl(resource);
      }

      return this.MyDataSource.request(resource, cb, errorCb);
    };

    return MyCDAPDataSource;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /dataprep/my-dataprep-api.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('myDataprepApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function myDataprepApi(myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl;
    var appPath = '/namespaces/:namespace/apps/dataprep';
    var baseServicePath = "".concat(appPath, "/services/service");
    var basepath = "".concat(baseServicePath, "/methods/workspaces/:workspaceId");
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace'
    }, {
      getWorkspace: myHelpers.getConfig('GET', 'REQUEST', basepath),
      getSchema: myHelpers.getConfig('POST', 'REQUEST', basepath + '/schema', true)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /datasets/my-dataset-api.js */

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
  angular.module(PKG.name + '.services').factory('myDatasetApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        listPath = '/namespaces/:namespace/data/datasets',
        basepath = '/namespaces/:namespace/data/datasets/:datasetId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      datasetId: '@datasetId'
    }, {
      list: myHelpers.getConfig('GET', 'REQUEST', listPath, true),
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      "delete": myHelpers.getConfig('DELETE', 'REQUEST', basepath),
      truncate: myHelpers.getConfig('POST', 'REQUEST', basepath + '/admin/truncate'),
      programsList: myHelpers.getConfig('GET', 'REQUEST', basepath + '/programs', true)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /explore/my-explore-api.js */

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
  angular.module(PKG.name + '.services').factory('myExploreApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/data/explore/tables',
        querypathNs = '/namespaces/:namespace/data/explore/queries',
        querypath = '/data/explore/queries/:queryhandle';
    return $resource(url({
      _cdapPath: basepath
    }), {
      table: '@table',
      queryhandle: '@queryhandle'
    }, {
      list: myHelpers.getConfig('GET', 'REQUEST', basepath, true),
      getInfo: myHelpers.getConfig('GET', 'REQUEST', basepath + '/:table/info'),
      postQuery: myHelpers.getConfig('POST', 'REQUEST', querypathNs),
      getQueries: myHelpers.getConfig('GET', 'REQUEST', querypathNs, true),
      getQuerySchema: myHelpers.getConfig('GET', 'REQUEST', querypath + '/schema', true),
      getQueryPreview: myHelpers.getConfig('POST', 'REQUEST', querypath + '/preview', true),
      pollQueryStatus: myHelpers.getConfig('GET', 'POLL', querypath + '/status', false, {
        interval: 2000
      }),
      stopPollQueryStatus: myHelpers.getConfig('GET', 'POLL-STOP', querypath + '/status')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /flows/my-flows-api.js */

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
  angular.module(PKG.name + '.services').factory('myFlowsApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/flows/:flowId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      flowId: '@flowId',
      runId: '@runId',
      flowletId: '@flowletId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      getFlowletInstance: myHelpers.getConfig('GET', 'REQUEST', basepath + '/flowlets/:flowletId/instances'),
      pollFlowletInstance: myHelpers.getConfig('GET', 'POLL', basepath + '/flowlets/:flowletId/instances'),
      setFlowletInstance: myHelpers.getConfig('PUT', 'REQUEST', basepath + '/flowlets/:flowletId/instances')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /hydrator/my-hydrator-factory.js */

  /*
    Copyright © 2015 Cask Data, Inc.
  
    Licensed under the Apache License, Version 2.0 (the "License"); you may not
    use this file except in compliance with the License. You may obtain a copy of
    the License at
  
    http://www.apache.org/licenses/LICENSE-2.0
  
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations under
    the License.
  */
  angular.module(PKG.name + '.services').factory('myHydratorFactory', ["GLOBALS", function (GLOBALS) {
    function isCustomApp(artifactName) {
      return !isETLApp(artifactName);
    }

    function isETLApp(artifactName) {
      return [GLOBALS.etlBatch, GLOBALS.etlRealtime, GLOBALS.etlDataPipeline, GLOBALS.etlDataStreams].indexOf(artifactName) !== -1;
    }

    return {
      isCustomApp: isCustomApp,
      isETLApp: isETLApp
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /hydrator/my-hydrator-validators.js */

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
  angular.module(PKG.name + '.services').factory('myHydratorValidatorsApi', ["$resource", function ($resource) {
    return $resource('', {}, {
      get: {
        url: '/validators',
        method: 'GET'
      }
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /hydrator/my-pipeline-api.js */

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
  angular.module(PKG.name + '.services').factory('myPipelineApi', ["$resource", "myHelpers", "GLOBALS", function ($resource, myHelpers, GLOBALS) {
    var templatePath = '/templates',
        pipelinePath = '/namespaces/:namespace/apps/:pipeline',
        macrosPath = pipelinePath + '/plugins',
        loadArtifactPath = '/namespaces/:namespace/artifacts/:artifactName',
        loadArtifactJSON = loadArtifactPath + '/versions/:version/properties',
        listPath = '/namespaces/:namespace/apps?artifactName=' + GLOBALS.etlBatch + ',' + GLOBALS.etlRealtime + ',' + GLOBALS.etlDataPipeline + ',' + GLOBALS.etlDataStreams,
        artifactsPath = '/namespaces/:namespace/artifacts?scope=SYSTEM',
        artifactsBasePath = '/namespaces/:namespace/artifacts',
        extensionsFetchBase = '/namespaces/:namespace/artifacts/:pipelineType/versions/:version/extensions',
        pluginFetchBase = extensionsFetchBase + '/:extensionType',
        pluginsFetchPath = pluginFetchBase + '?scope=system',
        extensionsFetchPath = extensionsFetchBase + '?scope=system',
        pluginDetailFetch = pluginFetchBase + '/plugins/:pluginName?scope=system',
        postActionDetailFetch = pluginFetchBase + '/plugins/:pluginName',
        artifactPropertiesPath = '/namespaces/:namespace/artifacts/:artifactName/versions/:artifactVersion/properties',
        pluginMethodsPath = '/namespaces/:namespace/artifacts/:artifactName/versions/:version/plugintypes/:pluginType/plugins/:pluginName/methods/:methodName',
        previewPath = '/namespaces/:namespace/previews',
        runsCountPath = '/namespaces/:namespace/runcount',
        latestRuns = '/namespaces/:namespace/runs';
    var pipelineAppPath = '/namespaces/system/apps/pipeline/services/studio/methods/v1';
    return $resource('', {}, {
      fetchMacros: myHelpers.getConfig('GET', 'REQUEST', macrosPath, true),
      loadArtifact: myHelpers.getConfig('POST', 'REQUEST', loadArtifactPath, false, {
        contentType: 'application/java-archive'
      }),
      loadJson: myHelpers.getConfig('PUT', 'REQUEST', loadArtifactJSON, false, {
        contentType: 'application/json'
      }),
      save: myHelpers.getConfig('PUT', 'REQUEST', pipelinePath, false, {
        contentType: 'application/json'
      }),
      getAllArtifacts: myHelpers.getConfig('GET', 'REQUEST', artifactsBasePath, true),
      fetchArtifacts: myHelpers.getConfig('GET', 'REQUEST', artifactsPath, true),
      fetchExtensions: myHelpers.getConfig('GET', 'REQUEST', extensionsFetchPath, true),
      fetchSources: myHelpers.getConfig('GET', 'REQUEST', pluginsFetchPath, true),
      fetchSinks: myHelpers.getConfig('GET', 'REQUEST', pluginsFetchPath, true),
      fetchTransforms: myHelpers.getConfig('GET', 'REQUEST', pluginsFetchPath, true),
      fetchTemplates: myHelpers.getConfig('GET', 'REQUEST', templatePath, true),
      fetchPlugins: myHelpers.getConfig('GET', 'REQUEST', pluginsFetchPath, true),
      fetchSourceProperties: myHelpers.getConfig('GET', 'REQUEST', pluginDetailFetch, true),
      fetchSinkProperties: myHelpers.getConfig('GET', 'REQUEST', pluginDetailFetch, true),
      fetchTransformProperties: myHelpers.getConfig('GET', 'REQUEST', pluginDetailFetch, true),
      fetchArtifactProperties: myHelpers.getConfig('GET', 'REQUEST', artifactPropertiesPath),
      // The above three could be replaced by this one.
      fetchPluginProperties: myHelpers.getConfig('GET', 'REQUEST', pluginDetailFetch, true),
      // This should ideally be merged with fetchPluginProperties, however the path has SYSTEM scope
      fetchPostActionProperties: myHelpers.getConfig('GET', 'REQUEST', postActionDetailFetch, true),
      // Batch fetching plugin properties
      fetchAllPluginsProperties: myHelpers.getConfig('POST', 'REQUEST', '/namespaces/:namespace/artifactproperties', true),
      // FIXME: This needs to be replaced with fetching etl-batch & etl-realtime separately.
      list: myHelpers.getConfig('GET', 'REQUEST', listPath, true),
      pollStatus: myHelpers.getConfig('GET', 'POLL', pipelinePath + '/status'),
      stopPollStatus: myHelpers.getConfig('GET', 'POLL-STOP', pipelinePath + '/status'),
      "delete": myHelpers.getConfig('DELETE', 'REQUEST', pipelinePath),
      runs: myHelpers.getConfig('GET', 'REQUEST', pipelinePath + '/runs', true),
      get: myHelpers.getConfig('GET', 'REQUEST', pipelinePath),
      datasets: myHelpers.getConfig('GET', 'REQUEST', pipelinePath + '/datasets', true),
      action: myHelpers.getConfig('POST', 'REQUEST', pipelinePath + '/:action'),
      // Batch runs count for pipelines
      getRunsCount: myHelpers.getConfig('POST', 'REQUEST', runsCountPath, true),
      getLatestRuns: myHelpers.getConfig('POST', 'REQUEST', latestRuns, true),
      postPluginMethod: myHelpers.getConfig('POST', 'REQUEST', pluginMethodsPath, false, {
        suppressErrors: true
      }),
      getPluginMethod: myHelpers.getConfig('GET', 'REQUEST', pluginMethodsPath, false, {
        suppressErrors: true
      }),
      putPluginMethod: myHelpers.getConfig('PUT', 'REQUEST', pluginMethodsPath, false, {
        suppressErrors: true
      }),
      deletePluginMethod: myHelpers.getConfig('DELETE', 'REQUEST', pluginMethodsPath, false, {
        suppressErrors: true
      }),
      // PREVIEW
      runPreview: myHelpers.getConfig('POST', 'REQUEST', '/namespaces/:namespace/previews', false, {
        suppressErrors: true
      }),
      stopPreview: myHelpers.getConfig('POST', 'REQUEST', '/namespaces/:namespace/previews/:previewId/stop', false, {
        suppressErrors: true
      }),
      getStagePreview: myHelpers.getConfig('POST', 'REQUEST', previewPath + '/:previewId/tracers', false, {
        suppressErrors: true
      }),
      // PIPELINE SYSTEM APP
      validateStage: myHelpers.getConfig('POST', 'REQUEST', pipelineAppPath + '/contexts/:context/validations/stage', false),
      // Draft management
      saveDraft: myHelpers.getConfig('PUT', 'REQUEST', pipelineAppPath + '/contexts/:context/drafts/:draftId', false),
      getDraft: myHelpers.getConfig('GET', 'REQUEST', pipelineAppPath + '/contexts/:context/drafts/:draftId', false),
      deleteDraft: myHelpers.getConfig('DELETE', 'REQUEST', pipelineAppPath + '/contexts/:context/drafts/:draftId', false)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /hydrator/my-pipeline-detailed-common-api.js */

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
  angular.module(PKG.name + '.services').factory('myPipelineCommonApi', ["$resource", "myHelpers", function ($resource, myHelpers) {
    var basePath = '/namespaces/:namespace/apps/:app/:programType/:programName';
    var runsPath = basePath + '/runs';
    var schedulePath = '/namespaces/:namespace/apps/:app/schedules/:schedule';
    return $resource('', {
      namespace: '@namespace',
      app: '@app',
      programType: '@programType',
      programName: '@programName',
      schedule: '@schedule'
    }, {
      start: myHelpers.getConfig('POST', 'REQUEST', basePath + '/start'),
      stop: myHelpers.getConfig('POST', 'REQUEST', basePath + '/stop'),
      schedule: myHelpers.getConfig('POST', 'REQUEST', schedulePath + '/resume'),
      suspend: myHelpers.getConfig('POST', 'REQUEST', schedulePath + '/suspend'),
      scheduleStatus: myHelpers.getConfig('GET', 'REQUEST', schedulePath + '/status'),
      getStatistics: myHelpers.getConfig('GET', 'REQUEST', basePath + '/statistics'),
      getRuns: myHelpers.getConfig('GET', 'REQUEST', runsPath),
      pollRuns: myHelpers.getConfig('GET', 'POLL', basePath + '/runs', true),
      nextRunTime: myHelpers.getConfig('GET', 'REQUEST', basePath + '/nextruntime', true)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /hydrator/my-pipeline-templatep-api.js */

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
  angular.module(PKG.name + '.services').factory('myPipelineTemplatesApi', ["$resource", function ($resource) {
    return $resource('', {
      apptype: '@apptype',
      appname: '@appname'
    }, {
      list: {
        url: '/predefinedapps/:apptype',
        method: 'GET',
        isArray: true
      },
      get: {
        url: '/predefinedapps/:apptype/:appname',
        method: 'GET'
      }
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /logsApi/my-logs-api.js */

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
  angular.module(PKG.name + '.services').factory('myLogsApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/:programType/:programId',
        logsPath = basepath + '/runs/:runId/logs?';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      programType: '@programType',
      programId: '@flowId',
      runId: '@runId',
      start: '@start',
      stop: '@stop',
      fromOffset: '@fromOffset'
    }, {
      getLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs', true),
      getLogsStartAsJson: myHelpers.getConfig('GET', 'REQUEST', logsPath + 'format=json&max=100&start=:start', true),
      getLogsStartAsRaw: myHelpers.getConfig('GET', 'REQUEST', logsPath + 'start=:start', false, {
        interceptor: {
          // This is very lame. ngResource by default considers EVERYTHING as json and converts plain string to JSON
          // Thank you angular, $resource
          response: function response(data) {
            return data.data;
          }
        }
      }),
      getLogsMetadata: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/', false),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      nextLogsJson: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next?format=json', true),
      nextProgramLogsJsonOffset: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/next?format=json', true),
      nextLogsJsonOffset: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next?format=json&max=100&fromOffset=:fromOffset', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      prevLogsJson: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /logsApi/my-preview-logs-api.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('myPreviewLogsApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/previews/:previewId',
        logsPath = basepath + '/logs?';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      previewId: '@previewId',
      start: '@start',
      stop: '@stop',
      fromOffset: '@fromOffset'
    }, {
      getLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs', true),
      getLogsStartAsJson: myHelpers.getConfig('GET', 'REQUEST', logsPath + 'format=json&max=100&start=:start', true),
      getLogsStartAsRaw: myHelpers.getConfig('GET', 'REQUEST', logsPath + 'start=:start', false, {
        interceptor: {
          // This is very lame. ngResource by default considers EVERYTHING as json and converts plain string to JSON
          // Thank you angular, $resource
          response: function response(data) {
            return data.data;
          }
        }
      }),
      getLogsStatus: myHelpers.getConfig('GET', 'REQUEST', basepath + '/status', false),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/next', true),
      nextLogsJson: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/next?format=json', true),
      nextLogsJsonOffset: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/next?format=json&max=100&fromOffset=:fromOffset', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/prev', true),
      prevLogsJson: myHelpers.getConfig('GET', 'REQUEST', basepath + '/logs/prev?format=json', true)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /mapreduce/my-mapreduce-api.js */

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
  angular.module(PKG.name + '.services').factory('myMapreduceApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/mapreduce/:mapreduceId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      mapreduceId: '@mapreduceId',
      runId: '@runId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      pollLatestRun: myHelpers.getConfig('GET', 'POLL', basepath + '/runs?limit=1', true, {
        interval: 2000
      }),
      stopPollLatestRun: myHelpers.getConfig('GET', 'POLL-STOP', basepath + '/runs?limit=1', true),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      runDetail: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /metadata/my-metadata-api.js */

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
  angular.module(PKG.name + '.services').factory('myMetadataApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        programPath = '/namespaces/:namespace/apps/:appId/:programType/:programId/metadata',
        datasetsPath = '/namespaces/:namespace/datasets/:datasetId/metadata',
        appsPath = '/namespaces/:namespace/apps/:appId/metadata';
    return $resource(url({
      _cdapPath: programPath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      programType: '@programType',
      programId: '@programId'
    }, {
      setProgramMetadata: myHelpers.getConfig('POST', 'REQUEST', programPath + '/tags'),
      getProgramMetadata: myHelpers.getConfig('GET', 'REQUEST', programPath, true),
      deleteProgramMetadata: myHelpers.getConfig('DELETE', 'REQUEST', programPath + '/tags/:tag'),
      setAppsMetadata: myHelpers.getConfig('POST', 'REQUEST', appsPath + '/tags'),
      getAppsMetadata: myHelpers.getConfig('GET', 'REQUEST', appsPath, true),
      deleteAppsMetadata: myHelpers.getConfig('DELETE', 'REQUEST', appsPath + '/tags/:tag'),
      setDatasetsMetadata: myHelpers.getConfig('POST', 'REQUEST', datasetsPath + '/tags'),
      getDatasetsMetadata: myHelpers.getConfig('GET', 'REQUEST', datasetsPath, true),
      deleteDatasetsMetadata: myHelpers.getConfig('DELETE', 'REQUEST', datasetsPath + '/tags/:tag')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /metadata/my-metadata-factory.js */

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
  angular.module(PKG.name + '.services').factory('myMetadataFactory', ["myMetadataApi", "$q", function (myMetadataApi, $q) {
    function getProgramMetadata(params) {
      var deferred = $q.defer();
      myMetadataApi.getProgramMetadata(params).$promise.then(function (res) {
        deferred.resolve(res);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getAppsMetadata(params) {
      var deferred = $q.defer();
      myMetadataApi.getAppsMetadata(params).$promise.then(function (res) {
        deferred.resolve(res);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getDatasetsMetadata(params) {
      var deferred = $q.defer();
      myMetadataApi.getDatasetsMetadata(params).$promise.then(function (res) {
        deferred.resolve(res);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getStreamsMetadata(params) {
      var deferred = $q.defer();
      myMetadataApi.getStreamsMetadata(params).$promise.then(function (res) {
        deferred.resolve(res);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function addProgramMetadata(tag, params) {
      var tagName = [tag];
      var deferred = $q.defer();
      myMetadataApi.setProgramMetadata(params, tagName).$promise.then(function () {
        return getProgramMetadata(params);
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function addAppsMetadata(tag, params) {
      var tagName = [tag];
      var deferred = $q.defer();
      myMetadataApi.setAppsMetadata(params, tagName).$promise.then(function () {
        return myMetadataApi.getAppsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function addDatasetsMetadata(tag, params) {
      var tagName = [tag];
      var deferred = $q.defer();
      myMetadataApi.setDatasetsMetadata(params, tagName).$promise.then(function () {
        return myMetadataApi.getDatasetsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function addStreamsMetadata(tag, params) {
      var tagName = [tag];
      var deferred = $q.defer();
      myMetadataApi.setStreamsMetadata(params, tagName).$promise.then(function () {
        return myMetadataApi.getStreamsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function deleteProgramMetadata(tag, params) {
      var deleteParams = angular.extend({
        tag: tag
      }, params);
      var deferred = $q.defer();
      myMetadataApi.deleteProgramMetadata(deleteParams).$promise.then(function () {
        return getProgramMetadata(params);
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function deleteAppsMetadata(tag, params) {
      var deleteParams = angular.extend({
        tag: tag
      }, params);
      var deferred = $q.defer();
      myMetadataApi.deleteAppsMetadata(deleteParams).$promise.then(function () {
        return myMetadataApi.getAppsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function deleteDatasetsMetadata(tag, params) {
      var deleteParams = angular.extend({
        tag: tag
      }, params);
      var deferred = $q.defer();
      myMetadataApi.deleteDatasetsMetadata(deleteParams).$promise.then(function () {
        return myMetadataApi.getDatasetsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    function deleteStreamsMetadata(tag, params) {
      var deleteParams = angular.extend({
        tag: tag
      }, params);
      var deferred = $q.defer();
      myMetadataApi.deleteStreamsMetadata(deleteParams).$promise.then(function () {
        return myMetadataApi.getStreamsMetadata(params).$promise;
      }).then(function (res) {
        deferred.resolve(res);
      });
      return deferred.promise;
    }

    return {
      getProgramMetadata: getProgramMetadata,
      getAppsMetadata: getAppsMetadata,
      getStreamsMetadata: getStreamsMetadata,
      getDatasetsMetadata: getDatasetsMetadata,
      addProgramMetadata: addProgramMetadata,
      deleteProgramMetadata: deleteProgramMetadata,
      addAppsMetadata: addAppsMetadata,
      deleteAppsMetadata: deleteAppsMetadata,
      addDatasetsMetadata: addDatasetsMetadata,
      deleteDatasetsMetadata: deleteDatasetsMetadata,
      addStreamsMetadata: addStreamsMetadata,
      deleteStreamsMetadata: deleteStreamsMetadata
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /pipeline-export-modal/pipeline-export-modal.js */

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
  angular.module(PKG.name + '.services').service('myPipelineExportModalService', ["$uibModal", function ($uibModal) {
    this.show = function (_config, _exportConfig) {
      if (!_config || !_exportConfig) {
        return;
      }

      var modalInstance = $uibModal.open({
        templateUrl: 'pipeline-export-modal/pipeline-export-modal-template.html',
        size: 'lg',
        keyboard: true,
        animation: false,
        windowTopClass: 'node-config-modal hydrator-modal',
        controller: ['$scope', 'config', '$timeout', 'exportConfig', function ($scope, config, $timeout, exportConfig) {
          var exportTimeout = null;
          $scope.config = JSON.stringify(config);

          $scope["export"] = function () {
            var blob = new Blob([JSON.stringify(exportConfig, null, 4)], {
              type: 'application/json'
            });
            $scope.url = URL.createObjectURL(blob);
            $scope.exportFileName = (exportConfig.name ? exportConfig.name : 'noname') + '-' + exportConfig.artifact.name;
            $scope.$on('$destroy', function () {
              URL.revokeObjectURL($scope.url);
            });
            $timeout.cancel(exportTimeout);
            exportTimeout = $timeout(function () {
              document.getElementById('pipeline-export-config-link').click();
              modalInstance.dismiss();
            });
          };

          $scope.$on('$destroy', function () {
            $timeout.cancel(exportTimeout);
          });
        }],
        resolve: {
          config: function config() {
            return _config;
          },
          exportConfig: function exportConfig() {
            return _exportConfig;
          }
        }
      });
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /preference/my-preference-api.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.services').factory('myPreferenceApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      programType: '@programType',
      programId: '@programId'
    }, {
      getSystemPreference: myHelpers.getConfig('GET', 'REQUEST', '/preferences'),
      setSystemPreference: myHelpers.getConfig('PUT', 'REQUEST', '/preferences'),
      getNamespacePreference: myHelpers.getConfig('GET', 'REQUEST', basepath + '/preferences'),
      setNamespacePreference: myHelpers.getConfig('PUT', 'REQUEST', basepath + '/preferences'),
      getNamespacePreferenceResolved: myHelpers.getConfig('GET', 'REQUEST', basepath + '/preferences?resolved=true'),
      getAppPreference: myHelpers.getConfig('GET', 'REQUEST', basepath + '/apps/:appId/preferences'),
      setAppPreference: myHelpers.getConfig('PUT', 'REQUEST', basepath + '/apps/:appId/preferences'),
      getAppPreferenceResolved: myHelpers.getConfig('GET', 'REQUEST', basepath + '/apps/:appId/preferences?resolved=true'),
      getProgramPreference: myHelpers.getConfig('GET', 'REQUEST', basepath + '/apps/:appId/:programType/:programId/preferences'),
      setProgramPreference: myHelpers.getConfig('PUT', 'REQUEST', basepath + '/apps/:appId/:programType/:programId/preferences')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /programs/program-helper.js */

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
  angular.module(PKG.name + '.services').factory('ProgramsHelpers', function () {
    // These two functions are utterly trivial and should not exist.
    // We will use these function as a way to understand what entity name should be
    // used in what places. For instance in logs and metrics singluar form is required
    // in runs and status plural form is required. Eventually when we fix UI to use
    // one single entity name then it will be easier for us to clean this across UI.
    var getSingularName = function getSingularName(entity) {
      return angular.isString(entity) && entity.slice(-1) === 's' ? entity.slice(0, entity.length - 1) : entity;
    };

    var getPluralName = function getPluralName(entity) {
      return entity + 's';
    };

    return {
      getSingularName: getSingularName,
      getPluralName: getPluralName
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /service/my-service-api.js */

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
  angular.module(PKG.name + '.services').factory('myServiceApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/services/:serviceId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      serviceId: '@mapreduceId',
      runId: '@runId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      runDetail: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /spark/my-spark-api.js */

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
  angular.module(PKG.name + '.services').factory('mySparkApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/spark/:sparkId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      sparkId: '@mapreduceId',
      runId: '@runId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      runDetail: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /tags/my-tags-api.js */

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
  angular.module(PKG.name + '.services').factory('myTagsApi', ["myCdapUrl", "$resource", "myHelpers", function (myCdapUrl, $resource, myHelpers) {
    var url = myCdapUrl.constructUrl,
        metadataPath = '/metadata/tags',
        basePath = '/namespaces/:namespaceId',
        appPath = basePath + '/apps/:appId',
        programPath = appPath + '/:programType/:programId',
        datasetPath = basePath + '/datasets/:datasetId',
        searchPath = basePath + '/metadata/search';
    return $resource(url({
      _cdapPath: basePath
    }), {
      namespaceId: '@namespaceId',
      datasetId: '@datasetId',
      programType: '@programType',
      programId: '@programId',
      appId: '@appId'
    }, {
      getAppTags: myHelpers.getConfig('GET', 'REQUEST', appPath + metadataPath, true),
      getProgramTags: myHelpers.getConfig('GET', 'REQUEST', programPath + metadataPath, true),
      getDatasetTags: myHelpers.getConfig('GET', 'REQUEST', datasetPath + metadataPath, true),
      searchTags: myHelpers.getConfig('GET', 'REQUEST', searchPath, false)
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /workers/my-workers-api.js */

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
  angular.module(PKG.name + '.services').factory('myWorkersApi', ["myCdapUrl", "$resource", "myAuth", "myHelpers", function (myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        basepath = '/namespaces/:namespace/apps/:appId/workers/:workerId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      sparkId: '@mapreduceId',
      runId: '@runId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      pollRuns: myHelpers.getConfig('GET', 'POLL', basepath + '/runs', true),
      pollLatestRun: myHelpers.getConfig('GET', 'POLL', basepath + '/runs?limit=1', true, {
        interval: 2000
      }),
      stopPollLatestRun: myHelpers.getConfig('GET', 'POLL-STOP', basepath + '/runs?limit=1', true),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      runDetail: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId'),
      doAction: myHelpers.getConfig('POST', 'REQUEST', basepath + '/:action'),
      getProgramStatus: myHelpers.getConfig('GET', 'REQUEST', basepath + '/status'),
      pollStatus: myHelpers.getConfig('GET', 'POLL', basepath + '/status')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /workflows/my-workflow-api.js */

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
  angular.module(PKG.name + '.services').factory('myWorkFlowApi', ["$state", "myCdapUrl", "$resource", "myHelpers", function ($state, myCdapUrl, $resource, myHelpers) {
    var url = myCdapUrl.constructUrl,
        schedulepath = '/namespaces/:namespace/apps/:appId/schedules/:scheduleId',
        basepath = '/namespaces/:namespace/apps/:appId/workflows/:workflowId';
    return $resource(url({
      _cdapPath: basepath
    }), {
      namespace: '@namespace',
      appId: '@appId',
      workflowId: '@workflowId',
      scheduleId: '@scheduleId',
      runId: '@runId'
    }, {
      get: myHelpers.getConfig('GET', 'REQUEST', basepath),
      status: myHelpers.getConfig('GET', 'REQUEST', basepath + '/status'),
      start: myHelpers.getConfig('POST', 'REQUEST', basepath + '/start'),
      stop: myHelpers.getConfig('POST', 'REQUEST', basepath + '/stop'),
      // Basically a utility/shorthand for the above three actions.
      doAction: myHelpers.getConfig('POST', 'REQUEST', basepath + '/:action'),
      pollStatus: myHelpers.getConfig('GET', 'POLL', basepath + '/status'),
      runs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs', true),
      runDetail: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId'),
      pollRuns: myHelpers.getConfig('GET', 'POLL', basepath + '/runs', true),
      stopPollRuns: myHelpers.getConfig('GET', 'POLL-STOP', basepath + '/runs', true),
      pollRunDetail: myHelpers.getConfig('GET', 'POLL', basepath + '/runs/:runId', false),
      pollRunDetailOften: myHelpers.getConfig('GET', 'POLL', basepath + '/runs/:runId', false, {
        interval: 1000
      }),
      stopPollRunDetail: myHelpers.getConfig('GET', 'POLL-STOP', basepath + '/runs/:runId'),
      stopRun: myHelpers.getConfig('POST', 'REQUEST', basepath + '/runs/:runId/stop'),
      suspendRun: myHelpers.getConfig('POST', 'REQUEST', basepath + '/runs/:runId/suspend'),
      resumeRun: myHelpers.getConfig('POST', 'REQUEST', basepath + '/runs/:runId/resume'),
      nextLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/next', true),
      prevLogs: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/logs/prev', true),
      schedules: myHelpers.getConfig('GET', 'REQUEST', basepath + '/schedules', true),
      schedulesPreviousRunTime: myHelpers.getConfig('GET', 'REQUEST', basepath + '/previousruntime', true),
      pollScheduleStatus: myHelpers.getConfig('GET', 'POLL', schedulepath + '/status', false, {
        interval: 2000
      }),
      getScheduleStatus: myHelpers.getConfig('GET', 'REQUEST', schedulepath + '/status'),
      scheduleSuspend: myHelpers.getConfig('POST', 'REQUEST', schedulepath + '/suspend'),
      scheduleResume: myHelpers.getConfig('POST', 'REQUEST', schedulepath + '/resume'),
      getCurrent: myHelpers.getConfig('GET', 'REQUEST', basepath + '/:runid/current', true),
      getUserNodeToken: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/nodes/:nodeId/token?scope=user'),
      getSystemNodeToken: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/nodes/:nodeId/token?scope=system'),
      getStatistics: myHelpers.getConfig('GET', 'REQUEST', basepath + '/statistics'),
      pollStatistics: myHelpers.getConfig('GET', 'POLL', basepath + '/statistics'),
      getNodesState: myHelpers.getConfig('GET', 'REQUEST', basepath + '/runs/:runId/nodes/state')
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-batch-pipeline-config/my-batch-pipeline-config-ctrl.js */

  /*
  * Copyright © 2017 Cask Data, Inc.
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
  var MyBatchPipelineConfigCtrl = /*#__PURE__*/function () {
    MyBatchPipelineConfigCtrl.$inject = ["uuid", "HydratorPlusPlusHydratorService", "HYDRATOR_DEFAULT_VALUES", "myPipelineApi", "$state", "myAlertOnValium", "GLOBALS"];
    function MyBatchPipelineConfigCtrl(uuid, HydratorPlusPlusHydratorService, HYDRATOR_DEFAULT_VALUES, myPipelineApi, $state, myAlertOnValium, GLOBALS) {
      _classCallCheck(this, MyBatchPipelineConfigCtrl);

      this.uuid = uuid;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.myAlertOnValium = myAlertOnValium;
      this.GLOBALS = GLOBALS;
      this.engine = this.store.getEngine();
      this.engineForDisplay = this.engine === 'mapreduce' ? 'MapReduce' : 'Apache Spark';
      this.instrumentation = this.store.getInstrumentation();
      this.stageLogging = this.store.getStageLogging();
      this.numRecordsPreview = this.store.getNumRecordsPreview();
      var rangeRecordsPreview = this.store.getRangeRecordsPreview();
      this.startingPipeline = false;
      this.updatingPipeline = false;
      this.driverResources = {
        memoryMB: this.store.getDriverMemoryMB(),
        virtualCores: this.store.getDriverVirtualCores()
      };
      this.executorResources = {
        memoryMB: this.store.getMemoryMB(),
        virtualCores: this.store.getVirtualCores()
      };
      this.enablePipelineUpdate = false;
      this.numberConfig = {
        'widget-attributes': {
          min: rangeRecordsPreview.min,
          max: rangeRecordsPreview.max,
          "default": HYDRATOR_DEFAULT_VALUES.numOfRecordsPreview,
          showErrorMessage: false,
          convertToInteger: true
        }
      };
      this.allowForceDynamicExecution = window.CDAP_UI_THEME.features['allow-force-dynamic-execution'];
      this.forceDynamicExecution = this.store.getForceDynamicExecution();
      this.showNumOfExecutors = this.getShowNumOfExecutors();
      this.numExecutorsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      this.numExecutors = this.store.getNumExecutors();
      this.customEngineConfig = {
        'pairs': HydratorPlusPlusHydratorService.convertMapToKeyValuePairs(this.store.getCustomConfigForDisplay())
      };

      if (this.customEngineConfig.pairs.length === 0) {
        this.customEngineConfig.pairs.push({
          key: '',
          value: '',
          uniqueId: 'id-' + this.uuid.v4()
        });
      }

      this.activeTab = 'runtimeArgs'; // studio config, but not in preview mode

      if (!this.isDeployed && !this.showPreviewConfig) {
        this.activeTab = 'pipelineConfig';
      }

      this.onCustomEngineConfigChange = this.onCustomEngineConfigChange.bind(this);
      this.onDriverMemoryChange = this.onDriverMemoryChange.bind(this);
      this.onDriverCoreChange = this.onDriverCoreChange.bind(this);
      this.onExecutorCoreChange = this.onExecutorCoreChange.bind(this);
      this.onExecutorMemoryChange = this.onExecutorMemoryChange.bind(this);
      this.onToggleInstrumentationChange = this.onToggleInstrumentationChange.bind(this);
      this.onStageLoggingChange = this.onStageLoggingChange.bind(this);
      this.myPipelineApi = myPipelineApi;
      this.$state = $state;
      this.containsMacros = HydratorPlusPlusHydratorService.runtimeArgsContainsMacros(this.runtimeArguments);
    }

    _createClass(MyBatchPipelineConfigCtrl, [{
      key: "onCustomEngineConfigChange",
      value: function onCustomEngineConfigChange(newCustomConfig) {
        this.customEngineConfig = newCustomConfig;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "numOfCustomEngineConfigFilled",
      value: function numOfCustomEngineConfigFilled() {
        return this.customEngineConfig.pairs.filter(function (pair) {
          return !_.isEmpty(pair.key) && !_.isEmpty(pair.value);
        }).length;
      }
    }, {
      key: "onEngineChange",
      value: function onEngineChange() {
        this.engineForDisplay = this.engine === 'mapreduce' ? 'MapReduce' : 'Apache Spark';
      }
    }, {
      key: "onForceDynamicEngineChange",
      value: function onForceDynamicEngineChange() {
        this.showNumOfExecutors = this.getShowNumOfExecutors();
      }
    }, {
      key: "getShowNumOfExecutors",
      value: function getShowNumOfExecutors() {
        return this.forceDynamicExecution === this.GLOBALS.dynamicExecutionForceOff;
      }
    }, {
      key: "getShowShuffleTrackingTimeout",
      value: function getShowShuffleTrackingTimeout() {
        return this.forceDynamicExecution === this.GLOBALS.dynamicExecutionForceOn;
      }
    }, {
      key: "applyConfig",
      value: function applyConfig() {
        this.applyRuntimeArguments();
        this.store.setEngine(this.engine);
        this.store.setCustomConfig(this.HydratorPlusPlusHydratorService.convertKeyValuePairsToMap(this.customEngineConfig));
        this.store.setInstrumentation(this.instrumentation);
        this.store.setStageLogging(this.stageLogging);
        this.store.setNumRecordsPreview(this.numRecordsPreview);
        this.store.setDriverVirtualCores(this.driverResources.virtualCores);
        this.store.setDriverMemoryMB(this.driverResources.memoryMB);
        this.store.setMemoryMB(this.executorResources.memoryMB);
        this.store.setVirtualCores(this.executorResources.virtualCores);
        this.store.setForceDynamicExecution(this.forceDynamicExecution);

        if (this.forceDynamicExecution === this.GLOBALS.dynamicExecutionForceOff) {
          this.store.setNumExecutors(this.numExecutors);
        }
      }
    }, {
      key: "applyAndClose",
      value: function applyAndClose() {
        this.applyConfig();
        this.onClose();
      }
    }, {
      key: "updateAndClose",
      value: function updateAndClose() {
        var _this = this;

        this.updatePipeline().then(function () {
          _this.applyConfig();

          _this.onClose();
        });
      }
    }, {
      key: "applyAndRunPipeline",
      value: function applyAndRunPipeline() {
        var _this2 = this;

        var applyAndRun = function applyAndRun() {
          _this2.startingPipeline = false;

          _this2.applyConfig();

          _this2.runPipeline();
        };

        this.startingPipeline = true;

        if (this.enablePipelineUpdate) {
          this.updatePipeline(false).then(applyAndRun.bind(this), function (err) {
            _this2.startingPipeline = false;

            _this2.myAlertOnValium.show({
              type: 'danger',
              content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
            });
          });
        } else {
          applyAndRun.call(this);
        }
      }
    }, {
      key: "buttonsAreDisabled",
      value: function buttonsAreDisabled() {
        var customConfigMissingValues = false;
        customConfigMissingValues = this.HydratorPlusPlusHydratorService.keyValuePairsHaveMissingValues(this.customEngineConfig);
        return customConfigMissingValues;
      }
    }, {
      key: "onDriverMemoryChange",
      value: function onDriverMemoryChange(value) {
        this.driverResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onDriverCoreChange",
      value: function onDriverCoreChange(value) {
        this.driverResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorCoreChange",
      value: function onExecutorCoreChange(value) {
        this.executorResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorMemoryChange",
      value: function onExecutorMemoryChange(value) {
        this.executorResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onToggleInstrumentationChange",
      value: function onToggleInstrumentationChange() {
        this.instrumentation = !this.instrumentation;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onStageLoggingChange",
      value: function onStageLoggingChange() {
        this.stageLogging = !this.stageLogging;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "updatePipelineEditStatus",
      value: function updatePipelineEditStatus() {
        var isResourcesEqual = function isResourcesEqual(oldvalue, newvalue) {
          return oldvalue.memoryMB === newvalue.memoryMB && oldvalue.virtualCores === newvalue.virtualCores;
        };

        var oldConfig = this.store.getCloneConfig();
        var updatedConfig = this.getUpdatedPipelineConfig();
        var isStageLoggingChanged = updatedConfig.config.stageLoggingEnabled !== oldConfig.config.stageLoggingEnabled;
        var isResourceModified = !isResourcesEqual(oldConfig.config.resources, updatedConfig.config.resources);
        var isDriverResourceModidified = !isResourcesEqual(oldConfig.config.driverResources, updatedConfig.config.driverResources);
        var isProcessTimingModified = oldConfig.config.processTimingEnabled !== updatedConfig.config.processTimingEnabled;
        var isCustomEngineConfigModified = oldConfig.config.properties !== updatedConfig.config.properties; // Pipeline update is only necessary in Detail view (i.e. after pipeline has been deployed)

        this.enablePipelineUpdate = this.isDeployed && (isStageLoggingChanged || isResourceModified || isDriverResourceModidified || isProcessTimingModified || isCustomEngineConfigModified);
      }
    }, {
      key: "getUpdatedPipelineConfig",
      value: function getUpdatedPipelineConfig() {
        var pipelineconfig = _.cloneDeep(this.store.getCloneConfig());

        delete pipelineconfig.__ui__;

        if (this.instrumentation) {
          pipelineconfig.config.stageLoggingEnabled = this.instrumentation;
        }

        pipelineconfig.config.resources = this.executorResources;
        pipelineconfig.config.driverResources = this.driverResources;
        pipelineconfig.config.stageLoggingEnabled = this.stageLogging;
        pipelineconfig.config.processTimingEnabled = this.instrumentation; // Have to do this, because unlike others we aren't actually directly modifying pipelineconfig.config.properties

        this.store.setCustomConfig(this.HydratorPlusPlusHydratorService.convertKeyValuePairsToMap(this.customEngineConfig));
        pipelineconfig.config.properties = this.store.getProperties();
        return pipelineconfig;
      }
    }, {
      key: "updatePipeline",
      value: function updatePipeline() {
        var _this3 = this;

        var updatingPipeline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var pipelineConfig = this.getUpdatedPipelineConfig();
        this.updatingPipeline = updatingPipeline;
        return this.myPipelineApi.save({
          namespace: this.$state.params.namespace,
          pipeline: pipelineConfig.name
        }, pipelineConfig).$promise.then(function () {
          _this3.updatingPipeline = false;
        }, function (err) {
          _this3.updatingPipeline = false;

          _this3.myAlertOnValium.show({
            type: 'danger',
            content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
          });
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MyBatchPipelineConfigCtrl;
  }();

  MyBatchPipelineConfigCtrl.$inject = ['uuid', 'HydratorPlusPlusHydratorService', 'HYDRATOR_DEFAULT_VALUES', 'myPipelineApi', '$state', 'myAlertOnValium', 'GLOBALS'];
  angular.module(PKG.name + '.commons').controller('MyBatchPipelineConfigCtrl', MyBatchPipelineConfigCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-batch-pipeline-config/my-batch-pipeline-config.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myBatchPipelineConfig', function () {
    return {
      restrict: 'E',
      scope: {
        runtimeArguments: '=',
        resolvedMacros: '=',
        applyRuntimeArguments: '&',
        pipelineName: '@',
        pipelineAction: '@',
        runPipeline: '&',
        onClose: '&',
        namespace: '@',
        store: '=',
        actionCreator: '=',
        isDeployed: '=',
        showPreviewConfig: '='
      },
      bindToController: true,
      controller: 'MyBatchPipelineConfigCtrl',
      controllerAs: 'BatchPipelineConfigCtrl',
      templateUrl: 'my-pipeline-configurations/my-batch-pipeline-config/my-batch-pipeline-config.html'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-realtime-pipeline-config/my-realtime-pipeline-config-ctrl.js */

  /*
  * Copyright © 2017 Cask Data, Inc.
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
  var MyRealtimePipelineConfigCtrl = /*#__PURE__*/function () {
    MyRealtimePipelineConfigCtrl.$inject = ["uuid", "HydratorPlusPlusHydratorService", "HYDRATOR_DEFAULT_VALUES", "HydratorPlusPlusPreviewStore", "HydratorPlusPlusPreviewActions", "myPipelineApi", "$state", "myAlertOnValium"];
    function MyRealtimePipelineConfigCtrl(uuid, HydratorPlusPlusHydratorService, HYDRATOR_DEFAULT_VALUES, HydratorPlusPlusPreviewStore, HydratorPlusPlusPreviewActions, myPipelineApi, $state, myAlertOnValium) {
      _classCallCheck(this, MyRealtimePipelineConfigCtrl);

      this.uuid = uuid;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.previewStore = HydratorPlusPlusPreviewStore;
      this.previewActions = HydratorPlusPlusPreviewActions;
      this.myPipelineApi = myPipelineApi;
      this.$state = $state;
      this.myAlertOnValium = myAlertOnValium;
      this.backpressure = this.store.getBackpressure();
      this.numExecutors = this.store.getNumExecutors();
      this.instrumentation = this.store.getInstrumentation();
      this.stageLogging = this.store.getStageLogging();
      this.checkpointing = this.store.getCheckpointing();
      this.checkpointDir = this.store.getCheckpointDir();
      this.batchInterval = this.store.getBatchInterval();
      this.batchIntervalTime = this.batchInterval.substring(0, this.batchInterval.length - 1);
      this.batchIntervalUnit = this.batchInterval.charAt(this.batchInterval.length - 1);
      var previewStoreState = this.previewStore.getState().preview;
      this.timeoutInMinutes = previewStoreState.timeoutInMinutes;
      this.startingPipeline = false;
      this.updatingPipeline = false;
      this.numExecutorsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      var batchIntervalTimeOptions = [];

      for (var i = 1; i <= 60; i++) {
        batchIntervalTimeOptions.push(i.toString());
      }

      this.batchIntervalTimeOptions = batchIntervalTimeOptions;
      this.batchIntervalUnits = {
        's': 'Seconds',
        'm': 'Minutes'
      };
      this.numberConfig = {
        'widget-attributes': {
          min: 0,
          max: 15,
          "default": this.timeoutInMinutes,
          showErrorMessage: false,
          convertToInteger: true
        }
      };
      this.customEngineConfig = {
        'pairs': HydratorPlusPlusHydratorService.convertMapToKeyValuePairs(this.store.getCustomConfigForDisplay())
      };

      if (this.customEngineConfig.pairs.length === 0) {
        this.customEngineConfig.pairs.push({
          key: '',
          value: '',
          uniqueId: 'id-' + this.uuid.v4()
        });
      }

      this.activeTab = 'runtimeArgs'; // studio config, but not in preview mode

      if (!this.isDeployed && !this.showPreviewConfig) {
        this.activeTab = 'pipelineConfig';
      }

      this.enablePipelineUpdate = false;
      this.onCustomEngineConfigChange = this.onCustomEngineConfigChange.bind(this);
      this.onDriverMemoryChange = this.onDriverMemoryChange.bind(this);
      this.onDriverCoreChange = this.onDriverCoreChange.bind(this);
      this.onExecutorCoreChange = this.onExecutorCoreChange.bind(this);
      this.onExecutorMemoryChange = this.onExecutorMemoryChange.bind(this);
      this.onClientCoreChange = this.onClientCoreChange.bind(this);
      this.onClientMemoryChange = this.onClientMemoryChange.bind(this);
      this.onBackpressureChange = this.onBackpressureChange.bind(this);
      this.onCheckPointingChange = this.onCheckPointingChange.bind(this);
      this.onInstrumentationChange = this.onInstrumentationChange.bind(this);
      this.onStageLoggingChange = this.onStageLoggingChange.bind(this);
      this.driverResources = {
        memoryMB: this.store.getDriverMemoryMB(),
        virtualCores: this.store.getDriverVirtualCores()
      };
      this.executorResources = {
        memoryMB: this.store.getMemoryMB(),
        virtualCores: this.store.getVirtualCores()
      };
      this.clientResources = {
        memoryMB: this.store.getClientMemoryMB(),
        virtualCores: this.store.getClientVirtualCores()
      };
      this.containsMacros = HydratorPlusPlusHydratorService.runtimeArgsContainsMacros(this.runtimeArguments);
    }

    _createClass(MyRealtimePipelineConfigCtrl, [{
      key: "onCustomEngineConfigChange",
      value: function onCustomEngineConfigChange(newCustomConfig) {
        this.customEngineConfig = newCustomConfig;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "numOfCustomEngineConfigFilled",
      value: function numOfCustomEngineConfigFilled() {
        return this.customEngineConfig.pairs.filter(function (pair) {
          return !_.isEmpty(pair.key) && !_.isEmpty(pair.value);
        }).length;
      }
    }, {
      key: "applyConfig",
      value: function applyConfig() {
        this.applyRuntimeArguments();
        this.store.setBackpressure(this.backpressure);
        this.store.setNumExecutors(this.numExecutors);
        this.store.setCustomConfig(this.HydratorPlusPlusHydratorService.convertKeyValuePairsToMap(this.customEngineConfig));
        this.store.setInstrumentation(this.instrumentation);
        this.store.setStageLogging(this.stageLogging);
        this.store.setCheckpointing(this.checkpointing);
        this.store.setCheckpointDir(this.checkpointDir);
        this.store.setBatchInterval(this.batchIntervalTime + this.batchIntervalUnit);
        this.store.setClientVirtualCores(this.clientResources.virtualCores);
        this.store.setClientMemoryMB(this.clientResources.memoryMB);
        this.store.setDriverVirtualCores(this.driverResources.virtualCores);
        this.store.setDriverMemoryMB(this.driverResources.memoryMB);
        this.store.setMemoryMB(this.executorResources.memoryMB);
        this.store.setVirtualCores(this.executorResources.virtualCores);
        this.previewStore.dispatch(this.previewActions.setTimeoutInMinutes(this.timeoutInMinutes));
      }
    }, {
      key: "applyAndRunPipeline",
      value: function applyAndRunPipeline() {
        var _this = this;

        var applyAndRun = function applyAndRun() {
          _this.startingPipeline = false;

          _this.applyConfig();

          _this.runPipeline();
        };

        this.startingPipeline = true;

        if (this.enablePipelineUpdate) {
          this.updatePipeline(false).then(applyAndRun.bind(this), function (err) {
            _this.startingPipeline = false;

            _this.myAlertOnValium.show({
              type: 'danger',
              content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
            });
          });
        } else {
          applyAndRun.call(this);
        }
      }
    }, {
      key: "applyAndClose",
      value: function applyAndClose() {
        this.applyConfig();
        this.onClose();
      }
    }, {
      key: "updateAndClose",
      value: function updateAndClose() {
        var _this2 = this;

        this.updatePipeline().then(function () {
          _this2.applyConfig();

          _this2.onClose();
        });
      }
    }, {
      key: "buttonsAreDisabled",
      value: function buttonsAreDisabled() {
        var runtimeArgsMissingValues = false;
        var customConfigMissingValues = false;

        if (this.isDeployed || this.showPreviewConfig) {
          runtimeArgsMissingValues = this.HydratorPlusPlusHydratorService.keyValuePairsHaveMissingValues(this.runtimeArguments);
        }

        customConfigMissingValues = this.HydratorPlusPlusHydratorService.keyValuePairsHaveMissingValues(this.customEngineConfig);
        return runtimeArgsMissingValues || customConfigMissingValues;
      }
    }, {
      key: "onDriverMemoryChange",
      value: function onDriverMemoryChange(value) {
        this.driverResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onDriverCoreChange",
      value: function onDriverCoreChange(value) {
        this.driverResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorCoreChange",
      value: function onExecutorCoreChange(value) {
        this.executorResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorMemoryChange",
      value: function onExecutorMemoryChange(value) {
        this.executorResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onClientCoreChange",
      value: function onClientCoreChange(value) {
        this.clientResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onClientMemoryChange",
      value: function onClientMemoryChange(value) {
        this.clientResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onCheckPointingChange",
      value: function onCheckPointingChange() {
        this.checkpointing = !this.checkpointing;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onInstrumentationChange",
      value: function onInstrumentationChange() {
        this.instrumentation = !this.instrumentation;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onStageLoggingChange",
      value: function onStageLoggingChange() {
        this.stageLogging = !this.stageLogging;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onBackpressureChange",
      value: function onBackpressureChange() {
        this.backpressure = !this.backpressure;
      }
    }, {
      key: "getUpdatedPipelineConfig",
      value: function getUpdatedPipelineConfig() {
        var pipelineconfig = _.cloneDeep(this.store.getCloneConfig());

        delete pipelineconfig.__ui__;

        if (this.instrumentation) {
          pipelineconfig.config.stageLoggingEnabled = this.instrumentation;
        }

        pipelineconfig.config.batchInterval = this.batchIntervalTime + this.batchIntervalUnit;
        pipelineconfig.config.resources = this.executorResources;
        pipelineconfig.config.driverResources = this.driverResources;
        pipelineconfig.config.clientResources = this.clientResources;
        pipelineconfig.config.disableCheckpoints = this.checkpointing;
        pipelineconfig.config.processTimingEnabled = this.instrumentation;
        pipelineconfig.config.stageLoggingEnabled = this.stageLogging; // Have to do this, because unlike others we aren't actually directly modifying pipelineconfig.config.properties

        this.store.setCustomConfig(this.HydratorPlusPlusHydratorService.convertKeyValuePairsToMap(this.customEngineConfig));
        pipelineconfig.config.properties = this.store.getProperties();
        return pipelineconfig;
      }
    }, {
      key: "updatePipelineEditStatus",
      value: function updatePipelineEditStatus() {
        var isResourcesEqual = function isResourcesEqual(oldvalue, newvalue) {
          return oldvalue.memoryMB === newvalue.memoryMB && oldvalue.virtualCores === newvalue.virtualCores;
        };

        var oldConfig = this.store.getCloneConfig();
        var updatedConfig = this.getUpdatedPipelineConfig();
        var isResourceModified = !isResourcesEqual(oldConfig.config.resources, updatedConfig.config.resources);
        var isDriverResourceModidified = !isResourcesEqual(oldConfig.config.driverResources, updatedConfig.config.driverResources);
        var isClientResourceModified = !isResourcesEqual(oldConfig.config.clientResources, updatedConfig.config.clientResources);
        var isDisableCheckpointModified = oldConfig.config.disableCheckpoints !== updatedConfig.config.disableCheckpoints;
        var isProcessTimingModified = oldConfig.config.processTimingEnabled !== updatedConfig.config.processTimingEnabled;
        var isStageLoggingModified = oldConfig.config.stageLoggingEnabled !== updatedConfig.config.stageLoggingEnabled;
        var isBatchIntervalModified = oldConfig.config.batchInterval !== updatedConfig.config.batchInterval;
        var isCustomEngineConfigModified = oldConfig.config.properties !== updatedConfig.config.properties; // Pipeline update is only necessary in Detail view (i.e. after pipeline has been deployed)

        this.enablePipelineUpdate = this.isDeployed && (isResourceModified || isDriverResourceModidified || isClientResourceModified || isDisableCheckpointModified || isProcessTimingModified || isStageLoggingModified || isBatchIntervalModified || isCustomEngineConfigModified);
      }
    }, {
      key: "updatePipeline",
      value: function updatePipeline() {
        var _this3 = this;

        var updatingPipeline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var pipelineConfig = this.getUpdatedPipelineConfig();
        this.updatingPipeline = updatingPipeline;
        return this.myPipelineApi.save({
          namespace: this.$state.params.namespace,
          pipeline: pipelineConfig.name
        }, pipelineConfig).$promise.then(function () {
          _this3.updatingPipeline = false;
        }, function (err) {
          _this3.updatingPipeline = false;

          _this3.myAlertOnValium.show({
            type: 'danger',
            content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
          });
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MyRealtimePipelineConfigCtrl;
  }();

  MyRealtimePipelineConfigCtrl.$inject = ['uuid', 'HydratorPlusPlusHydratorService', 'HYDRATOR_DEFAULT_VALUES', 'HydratorPlusPlusPreviewStore', 'HydratorPlusPlusPreviewActions', 'myPipelineApi', '$state', 'myAlertOnValium'];
  angular.module(PKG.name + '.commons').controller('MyRealtimePipelineConfigCtrl', MyRealtimePipelineConfigCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-realtime-pipeline-config/my-realtime-pipeline-config.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myRealtimePipelineConfig', function () {
    return {
      restrict: 'E',
      scope: {
        runtimeArguments: '=',
        resolvedMacros: '=',
        applyRuntimeArguments: '&',
        pipelineName: '@',
        runPipeline: '&',
        onClose: '&',
        namespace: '@',
        store: '=',
        actionCreator: '=',
        isDeployed: '=',
        showPreviewConfig: '='
      },
      bindToController: true,
      controller: 'MyRealtimePipelineConfigCtrl',
      controllerAs: 'RealtimePipelineConfigCtrl',
      templateUrl: 'my-pipeline-configurations/my-realtime-pipeline-config/my-realtime-pipeline-config.html'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-sql-pipeline-config/my-sql-pipeline-config-ctrl.js */

  /*
  * Copyright © 2019 Cask Data, Inc.
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
  var MySqlPipelineConfigCtrl = /*#__PURE__*/function () {
    MySqlPipelineConfigCtrl.$inject = ["uuid", "HydratorPlusPlusHydratorService", "HydratorPlusPlusPreviewStore", "HydratorPlusPlusPreviewActions", "myPipelineApi", "$state", "myAlertOnValium"];
    function MySqlPipelineConfigCtrl(uuid, HydratorPlusPlusHydratorService, HydratorPlusPlusPreviewStore, HydratorPlusPlusPreviewActions, myPipelineApi, $state, myAlertOnValium) {
      _classCallCheck(this, MySqlPipelineConfigCtrl);

      this.uuid = uuid;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.previewStore = HydratorPlusPlusPreviewStore;
      this.previewActions = HydratorPlusPlusPreviewActions;
      this.myPipelineApi = myPipelineApi;
      this.$state = $state;
      this.myAlertOnValium = myAlertOnValium;
      this.serviceAccountPath = this.store.getServiceAccountPath();
      this.instrumentation = this.store.getInstrumentation();
      this.stageLogging = this.store.getStageLogging();
      this.startingPipeline = false;
      this.updatingPipeline = false;
      this.activeTab = 'runtimeArgs'; // studio config, but not in preview mode

      if (!this.isDeployed && !this.showPreviewConfig) {
        this.activeTab = 'pipelineConfig';
      }

      this.enablePipelineUpdate = false;
      this.onDriverMemoryChange = this.onDriverMemoryChange.bind(this);
      this.onDriverCoreChange = this.onDriverCoreChange.bind(this);
      this.onExecutorCoreChange = this.onExecutorCoreChange.bind(this);
      this.onExecutorMemoryChange = this.onExecutorMemoryChange.bind(this);
      this.onClientCoreChange = this.onClientCoreChange.bind(this);
      this.onClientMemoryChange = this.onClientMemoryChange.bind(this);
      this.onServiceAccountChange = this.onServiceAccountChange.bind(this);
      this.onInstrumentationChange = this.onInstrumentationChange.bind(this);
      this.onStageLoggingChange = this.onStageLoggingChange.bind(this);
      this.driverResources = {
        memoryMB: this.store.getDriverMemoryMB(),
        virtualCores: this.store.getDriverVirtualCores()
      };
      this.executorResources = {
        memoryMB: this.store.getMemoryMB(),
        virtualCores: this.store.getVirtualCores()
      };
      this.clientResources = {
        memoryMB: this.store.getClientMemoryMB(),
        virtualCores: this.store.getClientVirtualCores()
      };
      this.containsMacros = HydratorPlusPlusHydratorService.runtimeArgsContainsMacros(this.runtimeArguments);
    }

    _createClass(MySqlPipelineConfigCtrl, [{
      key: "applyConfig",
      value: function applyConfig() {
        this.applyRuntimeArguments();
        this.store.setClientVirtualCores(this.clientResources.virtualCores);
        this.store.setClientMemoryMB(this.clientResources.memoryMB);
        this.store.setDriverVirtualCores(this.driverResources.virtualCores);
        this.store.setDriverMemoryMB(this.driverResources.memoryMB);
        this.store.setMemoryMB(this.executorResources.memoryMB);
        this.store.setVirtualCores(this.executorResources.virtualCores);
        this.store.setInstrumentation(this.instrumentation);
        this.store.setStageLogging(this.stageLogging);
        this.store.setServiceAccountPath(this.serviceAccountPath);
      }
    }, {
      key: "applyAndRunPipeline",
      value: function applyAndRunPipeline() {
        var _this = this;

        var applyAndRun = function applyAndRun() {
          _this.startingPipeline = false;

          _this.applyConfig();

          _this.runPipeline();
        };

        this.startingPipeline = true;

        if (this.enablePipelineUpdate) {
          this.updatePipeline(false).then(applyAndRun.bind(this), function (err) {
            _this.startingPipeline = false;

            _this.myAlertOnValium.show({
              type: 'danger',
              content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
            });
          });
        } else {
          applyAndRun.call(this);
        }
      }
    }, {
      key: "applyAndClose",
      value: function applyAndClose() {
        this.applyConfig();
        this.onClose();
      }
    }, {
      key: "updateAndClose",
      value: function updateAndClose() {
        var _this2 = this;

        this.updatePipeline().then(function () {
          _this2.applyConfig();

          _this2.onClose();
        });
      }
    }, {
      key: "buttonsAreDisabled",
      value: function buttonsAreDisabled() {
        var runtimeArgsMissingValues = false;

        if (this.isDeployed || this.showPreviewConfig) {
          runtimeArgsMissingValues = this.HydratorPlusPlusHydratorService.keyValuePairsHaveMissingValues(this.runtimeArguments);
        }

        return runtimeArgsMissingValues;
      }
    }, {
      key: "onServiceAccountChange",
      value: function onServiceAccountChange(value) {
        this.serviceAccountPath = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onInstrumentationChange",
      value: function onInstrumentationChange() {
        this.instrumentation = !this.instrumentation;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onStageLoggingChange",
      value: function onStageLoggingChange() {
        this.stageLogging = !this.stageLogging;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onDriverMemoryChange",
      value: function onDriverMemoryChange(value) {
        this.driverResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onDriverCoreChange",
      value: function onDriverCoreChange(value) {
        this.driverResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorCoreChange",
      value: function onExecutorCoreChange(value) {
        this.executorResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onExecutorMemoryChange",
      value: function onExecutorMemoryChange(value) {
        this.executorResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onClientCoreChange",
      value: function onClientCoreChange(value) {
        this.clientResources.virtualCores = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "onClientMemoryChange",
      value: function onClientMemoryChange(value) {
        this.clientResources.memoryMB = value;
        this.updatePipelineEditStatus();
      }
    }, {
      key: "getUpdatedPipelineConfig",
      value: function getUpdatedPipelineConfig() {
        var pipelineconfig = _.cloneDeep(this.store.getCloneConfig());

        delete pipelineconfig.__ui__;

        if (this.instrumentation) {
          pipelineconfig.config.stageLoggingEnabled = this.instrumentation;
        }

        pipelineconfig.config.resources = this.executorResources;
        pipelineconfig.config.driverResources = this.driverResources;
        pipelineconfig.config.clientResources = this.clientResources;
        pipelineconfig.config.serviceAccountPath = this.serviceAccountPath;
        pipelineconfig.config.processTimingEnabled = this.instrumentation;
        pipelineconfig.config.stageLoggingEnabled = this.stageLogging; // Have to do this, because unlike others we aren't actually directly modifying pipelineconfig.config.properties

        pipelineconfig.config.properties = this.store.getProperties();
        return pipelineconfig;
      }
    }, {
      key: "updatePipelineEditStatus",
      value: function updatePipelineEditStatus() {
        var isResourcesEqual = function isResourcesEqual(oldvalue, newvalue) {
          return oldvalue.memoryMB === newvalue.memoryMB && oldvalue.virtualCores === newvalue.virtualCores;
        };

        var oldConfig = this.store.getCloneConfig();
        var updatedConfig = this.getUpdatedPipelineConfig();
        var isResourceModified = !isResourcesEqual(oldConfig.config.resources, updatedConfig.config.resources);
        var isDriverResourceModidified = !isResourcesEqual(oldConfig.config.driverResources, updatedConfig.config.driverResources);
        var isClientResourceModified = !isResourcesEqual(oldConfig.config.clientResources, updatedConfig.config.clientResources);
        var isServiceAccountPathModified = oldConfig.config.serviceAccountPath !== updatedConfig.config.serviceAccountPath;
        var isProcessTimingModified = oldConfig.config.processTimingEnabled !== updatedConfig.config.processTimingEnabled;
        var isStageLoggingModified = oldConfig.config.stageLoggingEnabled !== updatedConfig.config.stageLoggingEnabled; // Pipeline update is only necessary in Detail view (i.e. after pipeline has been deployed)

        this.enablePipelineUpdate = this.isDeployed && (isResourceModified || isDriverResourceModidified || isClientResourceModified || isServiceAccountPathModified || isProcessTimingModified || isStageLoggingModified);
      }
    }, {
      key: "updatePipeline",
      value: function updatePipeline() {
        var _this3 = this;

        var updatingPipeline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var pipelineConfig = this.getUpdatedPipelineConfig();
        this.updatingPipeline = updatingPipeline;
        return this.myPipelineApi.save({
          namespace: this.$state.params.namespace,
          pipeline: pipelineConfig.name
        }, pipelineConfig).$promise.then(function () {
          _this3.updatingPipeline = false;
        }, function (err) {
          _this3.updatingPipeline = false;

          _this3.myAlertOnValium.show({
            type: 'danger',
            content: _typeof(err) === 'object' ? JSON.stringify(err) : 'Updating pipeline failed: ' + err
          });
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MySqlPipelineConfigCtrl;
  }();

  angular.module(PKG.name + '.commons').controller('MySqlPipelineConfigCtrl', MySqlPipelineConfigCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-sql-pipeline-config/my-sql-pipeline-config.js */

  /*
   * Copyright © 2019 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('mySqlPipelineConfig', function () {
    return {
      restrict: 'E',
      scope: {
        runtimeArguments: '=',
        resolvedMacros: '=',
        applyRuntimeArguments: '&',
        pipelineName: '@',
        runPipeline: '&',
        onClose: '&',
        namespace: '@',
        store: '=',
        actionCreator: '=',
        isDeployed: '=',
        showPreviewConfig: '='
      },
      bindToController: true,
      controller: 'MySqlPipelineConfigCtrl',
      controllerAs: 'SqlPipelineConfigCtrl',
      templateUrl: 'my-pipeline-configurations/my-sql-pipeline-config/my-sql-pipeline-config.html'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /app-level-loading-icon/loading.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('loadingIcon', ["myLoadingService", "$uibModal", "$timeout", "EventPipe", function (myLoadingService, $uibModal, $timeout, EventPipe) {
    return {
      restrict: 'EA',
      scope: true,
      template: '<div></div>',
      controller: ["$scope", function controller($scope) {
        var modalObj = {
          templateUrl: 'app-level-loading-icon/loading.html',
          backdrop: 'static',
          keyboard: true,
          scope: $scope,
          windowClass: 'custom-loading-modal'
        },
            modal,
            isBackendDown = false;
        var hideLoadingTimeout = null;
        EventPipe.on('hideLoadingIcon', function () {
          // Just making it smooth instead of being too 'speedy'
          $timeout.cancel(hideLoadingTimeout);
          hideLoadingTimeout = $timeout(function () {
            if (!isBackendDown) {
              if (modal && !modal.$state) {
                modal.close();
              }

              modal = null;
            }
          }, 2000);
        }); // Should use this hide when we are just loading a state

        EventPipe.on('hideLoadingIcon.immediate', function () {
          if (modal) {
            // This is needed if the loading icon is shown and closed even before opened.
            // EventPipe will execute the listener immediately when the event is emitted,
            // however $alert which internally used $modal opens up only during next tick.
            // If the modal is opened and is closed at some point later (normal usecase),
            // the 'opened' promise is still resolved and the alert is closed.
            modal.opened.then(function () {
              modal.close();
              modal = null;
            });
          }
        });
        EventPipe.on('showLoadingIcon', function (message, userCloseEnabled) {
          if (!modal && !isBackendDown) {
            $scope.message = message || 'Loading...';

            if (!userCloseEnabled) {
              modalObj.keyboard = false;
            } else {
              modalObj.keyboard = true;
            }

            modal = $uibModal.open(modalObj);
          }
        }.bind($scope));
      }]
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-confirmable/confirmable.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskConfirmable
   *
   * adds a "caskConfirm" method on the scope. call that, and
   *  the expression in "cask-confirmable" attribute will be evaluated
   *  after the user accepts the confirmation dialog. Eg:
   *
   * <a ng-click="caskConfirm()"
   *       cask-confirmable="doDelete(model)"
   *       data-confirmable-title="Hold on..."
   *       data-confirmable-content="Are you absolutely sure?"
   * >delete</a>
   */
  angular.module(PKG.name + '.commons').directive('caskConfirmable', ["$modal", "$sce", function caskConfirmableDirective($modal, $sce) {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        scope.caskConfirm = function () {
          var modal, modalScope;
          modalScope = scope.$new(true);
          modalScope.customClass = attrs.confirmableModalClass || '';

          modalScope.doConfirm = function () {
            modal.hide();
            scope.$eval(attrs.caskConfirmable);
          };

          var confirmableContent = $sce.getTrustedHtml(attrs.confirmableContent);
          modal = $modal({
            scope: modalScope,
            template: 'cask-angular-confirmable/confirm-modal.html',
            title: attrs.confirmableTitle || 'Confirmation',
            content: confirmableContent || 'Are you sure?',
            placement: 'center',
            show: true
          });
        };
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-dropdown-text-combo/dropdown-text-combo.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('caskDropdownTextCombo', function caskDropdownTextComboDirective() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        dropdownList: '=',
        textFields: '=',
        assetLabel: '@'
      },
      templateUrl: 'cask-angular-dropdown-text-combo/dropdown-text-combo.html',
      link: function link($scope) {
        $scope.dropdownValues = [];

        function buildDropdown() {
          //dropdownList doesn't always needs to be a $resource object with a promise.
          if ($scope.dropdownList.$promise && !$scope.dropdownList.$resolved || !$scope.model) {
            return;
          }

          $scope.dropdownValues = $scope.dropdownList.filter(function (item) {
            var isValid = Object.keys($scope.model).indexOf(item.name) === -1;
            return isValid;
          }).map(function (item) {
            return {
              text: item.name,
              click: 'addAsset(\"' + item.name + '\")'
            };
          });
        } //dropdownList doesn't always needs to be a $resource object with a promise.


        if ($scope.dropdownList.$promise) {
          $scope.dropdownList.$promise.then(buildDropdown);
        }

        $scope.$watchCollection('model', buildDropdown);

        $scope.rmAsset = function (pName) {
          delete $scope.model[pName];
        };

        $scope.addAsset = function (pName) {
          if (!$scope.model) {
            return;
          }

          $scope.model[pName] = {
            name: pName
          };
        };
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-focus/focus-service.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskFocusManager
   * watched by the caskFocus directive, this service can be called
   *  from a controller to trigger focus() events, presumably on form inputs
   * @return {Object}  with "focus" and "select" methods
   */
  angular.module(PKG.name + '.commons').service('caskFocusManager', ["$rootScope", "$log", "$timeout", function caskFocusManagerService($rootScope, $log, $timeout) {
    var last = null;
    this.is = $rootScope.$new(true);

    function set(k, v) {
      var scope = this.is;
      $timeout(function () {
        $log.log('[caskFocusManager]', v, k);
        scope[last] = false;
        var o = {};
        o[v] = Date.now();
        scope[k] = o;
        last = k;
      });
    }
    /**
     * triggers focus() on element with cask-focus = k
     * @param  {String} k
     */


    this.focus = function (k) {
      set.call(this, k, 'focus');
    };
    /**
     * triggers select() on element with cask-focus = k
     * @param  {String} k
     */


    this.select = function (k) {
      set.call(this, k, 'select');
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-focus/focus.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskFocus
   *
   * add the cask-focus attribute to elements that you will want to trigger focus/select on
   *  then in the controller, use caskFocusManager to trigger the DOM event
   *
   * in template:
   * <input type="text" cask-focus="aNameForTheField" />
   *
   * in controller, inject caskFocusManager, then:
   * caskFocusManager.focus('aNameForTheField');
   */
  angular.module(PKG.name + '.commons').directive('caskFocus', ["$timeout", "caskFocusManager", function caskFocusDirective($timeout, caskFocusManager) {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        attrs.$observe('caskFocus', function (newVal) {
          var cleanup = caskFocusManager.is.$watch(newVal, function (o) {
            if (o) {
              $timeout(function () {
                if (o.focus) {
                  element[0].focus();
                } else if (o.select) {
                  element[0].select();
                }
              });
            }
          });
          scope.$on('$destroy', function () {
            cleanup();
          });
        });
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-json-edit/jsonedit.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskJsonEdit
   *
   * adapted from https://gist.github.com/maxbates/11002270
   *
   * <textarea cask-json-edit="myObject" rows="8" class="form-control"></textarea>
   */
  angular.module(PKG.name + '.commons').directive('caskJsonEdit', function myJsonEditDirective() {
    return {
      restrict: 'A',
      require: 'ngModel',
      template: '<textarea ng-model="jsonEditing"></textarea>',
      replace: true,
      scope: {
        model: '=caskJsonEdit'
      },
      link: function link(scope, element, attrs, ngModelCtrl) {
        //init
        setEditing(scope.model); //check for changes going out

        scope.$watch('jsonEditing', function (newval, oldval) {
          if (newval !== oldval) {
            if (isValidJson(newval)) {
              setValid();
              updateModel(newval);
            } else {
              setInvalid();
            }
          }
        }, true); //check for changes coming in

        scope.$watch('model', function (newval, oldval) {
          if (newval !== oldval) {
            setEditing(newval);
          }
        }, true);

        function setEditing(value) {
          scope.jsonEditing = angular.copy(json2string(value));
        }

        function updateModel(value) {
          scope.model = string2json(value);
        }

        function setValid() {
          ngModelCtrl.$setValidity('json', true);
        }

        function setInvalid() {
          ngModelCtrl.$setValidity('json', false);
        }

        function string2json(text) {
          try {
            return angular.fromJson(text);
          } catch (err) {
            setInvalid();
            return text;
          }
        }

        function json2string(obj) {
          // better than JSON.stringify(), because it formats + filters $$hashKey etc.
          // NOTE that this will remove all $-prefixed values
          return angular.toJson(obj, true);
        }

        function isValidJson(model) {
          var flag = true;

          try {
            angular.fromJson(model);
          } catch (err) {
            flag = false;
          }

          return flag;
        }
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-password/password.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskPassword
   *
   * implements "click2show" behavior
   *
   * <cask-password data-value="password"></cask-password>
   */
  angular.module(PKG.name + '.commons').directive('caskPassword', ["caskFocusManager", function caskPasswordDirective(caskFocusManager) {
    return {
      restrict: 'E',
      templateUrl: 'cask-angular-password/click2show.html',
      replace: true,
      scope: {
        value: '='
      },
      link: function link(scope) {
        scope.uid = ['caskPassword', Date.now(), Math.random().toString().substr(2)].join('_');

        scope.doToggle = function () {
          var show = !scope.show;
          scope.show = show;

          if (show) {
            caskFocusManager.select(scope.uid);
          }
        };
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-progress/progress.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskProgress
   *
   *  <cask-progress
   *      data-type="bar"
   *      data-add-cls="success striped"
   *      data-value="model.progress.stepscompleted"
   *      data-max="model.progress.stepstotal"
   *    ></cask-progress>
   */
  angular.module(PKG.name + '.commons').directive('caskProgress', function caskProgressDirective() {
    return {
      restrict: 'E',
      templateUrl: 'cask-angular-progress/bar.html',
      replace: true,
      scope: {
        addCls: '@',
        value: '=',
        max: '='
      },
      link: function link(scope, element, attrs) {
        scope.$watch('value', function (newVal) {
          var max = parseInt(scope.max, 10) || 100;
          scope.percent = Math.floor(newVal / max * 100);
          var cls = {
            'active': newVal < max,
            'progress-bar': true
          };

          if (scope.addCls) {
            angular.forEach(scope.addCls.split(' '), function (add) {
              if (add) {
                switch (attrs.type) {
                  case 'bar':
                  /* falls through */

                  default:
                    cls['progress-bar-' + add] = true;
                    break;
                }
              }
            });
          }

          scope.cls = cls;
        });
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-promptable/prompt.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskPrompt
   *
   * adds a "caskPrompt" method on the scope. call that, and
   *  the specified binding will be set to the user input
   *  from a modal dialog. Eg:
   *
   * <a ng-click="caskPrompt('Please enter a new name', 'new '+model.name)"
   *       cask-promptable="model.name = $value"
   * >rename</a>
   */
  angular.module(PKG.name + '.commons').directive('caskPromptable', ["$modal", "caskFocusManager", function caskPromptableDirective($modal, caskFocusManager) {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        var m = $modal({
          template: 'cask-angular-promptable/prompt-modal.html',
          placement: 'center',
          show: false,
          prefixEvent: 'cask-promptable-modal'
        });
        angular.extend(m.$scope, {
          value: '',
          title: 'Prompt',
          evalPromptable: function evalPromptable() {
            scope.$eval(attrs.caskPromptable, {
              '$value': m.$scope.data.value
            });
            m.hide();
          }
        });
        scope.$on('$destroy', function () {
          m.destroy();
        });
        m.$scope.$on('cask-promptable-modal.show', function () {
          caskFocusManager.select('caskPromptModal');
        });

        scope.caskPrompt = function (text, prefill) {
          if (!angular.isUndefined(text)) {
            m.$scope.title = text;
          }

          if (!angular.isUndefined(prefill)) {
            // 2.3.1 version of angular-strap's modal creates a new scope for just the modal.
            // modalScope which gets created and destroyed as the modal is opened and closed.
            // Hence in order to get the 2-way binding we are passing in a reference instead of
            // a value.
            m.$scope.data = {};
            m.$scope.data.value = prefill;
          }

          m.show();
        };
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-sortable/sortable.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * caskSortable
   * makes a <table> sortable
   *
   * adds "sortable.predicate" and "sortable.reverse" to the scope
   *
   * <table my-sortable>
   *  <thead>
   *    <tr ng-class="{'sort-enabled': list.length>1}">
   *      <th data-predicate="createTime" data-predicate-default="reverse">creation time</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *   <tr ng-repeat="item in list | orderBy:sortable.predicate:sortable.reverse">
   *    <td>...
   */
  angular.module(PKG.name + '.commons').directive('caskSortable', ["$log", "$stateParams", "$state", function caskSortableDirective($log, $stateParams, $state) {
    return {
      restrict: 'A',
      link: function link(scope, element, attrs) {
        var headers = element.find('th'),
            defaultPredicate,
            defaultReverse,
            noInitialSort;
        noInitialSort = attrs.noInitialSort === 'true' ? true : false;
        angular.forEach(headers, function (th) {
          th = angular.element(th);
          var a;

          if (!$stateParams.sortBy) {
            a = th.attr('data-predicate-default');
          }

          if ($stateParams.sortBy && th.attr('data-predicate') === $stateParams.sortBy) {
            defaultPredicate = th;
            defaultReverse = $stateParams.reverse === 'reverse';
          } else if (angular.isDefined(a)) {
            defaultPredicate = th;
            defaultReverse = a === 'reverse';
          }
        });

        if (!defaultPredicate) {
          defaultPredicate = headers.eq(0);
        }

        $state.go($state.$current.name, {
          sortBy: defaultPredicate.attr('data-predicate'),
          reverse: defaultReverse ? 'reverse' : ''
        });
        scope.sortable = {
          reverse: defaultReverse
        };

        if (noInitialSort) {
          scope.sortable.predicate = null;
        } else {
          scope.sortable.predicate = getPredicate(defaultPredicate.addClass('predicate'));
        }

        headers.append('<i class="fa fa-toggle-down"></i>');
        headers.on('click', function () {
          var th = angular.element(this),
              predicate = getPredicate(th);

          if (th.attr('skip-sort')) {
            return;
          }

          scope.$apply(function () {
            if (scope.sortable.predicate === predicate) {
              scope.sortable.reverse = !scope.sortable.reverse;
              th.find('i').toggleClass('fa-flip-vertical');
            } else {
              headers.removeClass('predicate');
              headers.find('i').removeClass('fa-flip-vertical');
              scope.sortable = {
                predicate: predicate,
                reverse: false
              };
              th.addClass('predicate');
            }
          });
          $state.go($state.$current.name, {
            sortBy: predicate,
            reverse: scope.sortable.reverse ? 'reverse' : ''
          });
        });
      }
    };

    function getPredicate(node) {
      return node.attr('data-predicate') || node.text();
    }
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cron-schedule-view/cron-schedule-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('CronScheduleViewController', ["$scope", function ($scope) {
    var cronExpression = $scope.model.split(' ');
    $scope.schedule = {
      time: {}
    };
    $scope.schedule.time.min = cronExpression[0];
    $scope.schedule.time.hour = cronExpression[1];
    $scope.schedule.time.day = cronExpression[2];
    $scope.schedule.time.month = cronExpression[3];
    $scope.schedule.time.week = cronExpression[4];
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cron-schedule-view/cron-schedule-view.js */

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
  angular.module(PKG.name + '.commons').directive('myCronScheduleView', function () {
    return {
      restrict: 'EA',
      scope: {
        model: '=ngModel'
      },
      templateUrl: 'cron-schedule-view/cron-schedule-view.html',
      controller: 'CronScheduleViewController'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /dag-minimap/dag-minimap-ctrl.js */

  /*
   * Copyright © 2019 Cask Data, Inc.
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
  var DAGMinimapCtrl = /*#__PURE__*/function () {
    DAGMinimapCtrl.$inject = ["DAGPlusPlusNodesStore", "DAGMinimapUtilities", "$scope", "$window", "$timeout", "DAGPlusPlusNodesActionsFactory"];
    function DAGMinimapCtrl(DAGPlusPlusNodesStore, DAGMinimapUtilities, $scope, $window, $timeout, DAGPlusPlusNodesActionsFactory) {
      var _this = this;

      _classCallCheck(this, DAGMinimapCtrl);

      this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
      this.DAGMinimapUtilities = DAGMinimapUtilities;
      this.$timeout = $timeout;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.MINIMAP_MIN_NUMBER_NODES = 6;
      this.state = {
        nodes: [],
        viewport: {}
      };
      DAGPlusPlusNodesStore.registerOnChangeListener(this.updateState.bind(this));
      $scope.$watch(function () {
        return _this.canvasScale;
      }, this.updateState.bind(this));

      var debouncedUpdateContainerSize = _.debounce(this.updateDAGContainerSize.bind(this), 300);

      var windowElem = angular.element($window);
      windowElem.on('resize', debouncedUpdateContainerSize);
      this.viewportTimeout = $timeout(this.handleViewportDrag.bind(this));
      $scope.$on('$destroy', function () {
        windowElem.off('resize', debouncedUpdateContainerSize);

        if (_this.containerSizeTimeout) {
          _this.$timeout.cancel(_this.containerSizeTimeout);
        }

        if (_this.viewportTimeout) {
          _this.$timeout.cancel(_this.viewportTimeout);
        }

        if (_this.updateStateTimeout) {
          _this.$timeout.cancel(_this.updateStateTimeout);
        }
      });
    }

    _createClass(DAGMinimapCtrl, [{
      key: "handleViewportDrag",
      value: function handleViewportDrag() {
        this.viewportElem = document.getElementById('viewport-container');
        this.viewportElem.addEventListener('mousedown', this.dragStart.bind(this));
        this.viewportElem.addEventListener('mousemove', this.drag.bind(this));
        this.viewportElem.addEventListener('mouseup', this.dragEnd.bind(this));
      }
    }, {
      key: "dragStart",
      value: function dragStart(e) {
        if (e.which !== 1) {
          return;
        } // should only apply for left mouse click


        this.viewportRect = this.viewportElem.getBoundingClientRect();
        this.active = true;
        this.viewportDragHandler(e);
      }
    }, {
      key: "dragEnd",
      value: function dragEnd() {
        this.active = false;
      }
    }, {
      key: "drag",
      value: function drag(e) {
        if (!this.active) {
          return;
        }

        e.preventDefault();
        this.viewportDragHandler(e);
      }
    }, {
      key: "viewportDragHandler",
      value: function viewportDragHandler(e) {
        var posX = e.clientX - this.viewportRect.x;
        var posY = e.clientY - this.viewportRect.y; // if drag goes out of the boundary of the minimap

        if (posX <= 0 || posY <= 0 || posX >= this.viewportRect.width || posY >= this.viewportRect.height) {
          this.dragEnd();
          return;
        }

        var viewportPosition = this.DAGMinimapUtilities.getViewportLocation(posX, posY, this.graphMetadata, this.canvasScale);
        this.DAGPlusPlusNodesActionsFactory.setCanvasPanning({
          top: viewportPosition.y,
          left: viewportPosition.x
        });
        this.panning({
          top: viewportPosition.y,
          left: viewportPosition.x
        });
      }
    }, {
      key: "updateDAGContainerSize",
      value: function updateDAGContainerSize() {
        var _this2 = this;

        this.containerSizeTimeout = this.$timeout(function () {
          var dagContainer = document.getElementById('diagram-container');
          _this2.dagContainerSize = dagContainer.getBoundingClientRect();

          _this2.updateState();
        });
      }
    }, {
      key: "getViewportBox",
      value: function getViewportBox() {
        if (!this.dagContainerSize) {
          this.updateDAGContainerSize();
          return {};
        }

        var viewport = this.DAGMinimapUtilities.getViewportBox(this.graphMetadata, this.dagContainerSize, this.canvasScale, this.DAGPlusPlusNodesStore.getCanvasPanning());

        if (!viewport) {
          return;
        }

        return {
          height: "".concat(viewport.height, "px"),
          width: "".concat(viewport.width, "px"),
          top: "".concat(viewport.top, "px"),
          left: "".concat(viewport.left, "px")
        };
      }
    }, {
      key: "updateState",
      value: function updateState() {
        var _this3 = this;

        var state = this.DAGPlusPlusNodesStore;
        var minimap = this.updateNodesAndViewport(state.getNodes());

        if (this.updateStateTimeout) {
          this.$timeout.cancel(this.updateStateTimeout);
        }

        this.updateStateTimeout = this.$timeout(function () {
          _this3.state = {
            nodes: minimap.nodes,
            viewport: minimap.viewport
          };
        });
      }
    }, {
      key: "updateNodesAndViewport",
      value: function updateNodesAndViewport(nodesReference) {
        var _this4 = this;

        var nodes = angular.copy(nodesReference);
        var graphMetadata = this.DAGMinimapUtilities.getGraphMetadata(nodes);
        this.graphMetadata = graphMetadata;
        nodes.forEach(function (node) {
          var nodeMetadata = _this4.DAGMinimapUtilities.getNodeMetadata(node, graphMetadata);

          node.minimapStyle = {
            height: "".concat(nodeMetadata.height, "px"),
            width: "".concat(nodeMetadata.width, "px"),
            left: "".concat(nodeMetadata.left, "px"),
            top: "".concat(nodeMetadata.top, "px")
          };
        });
        var viewport = this.getViewportBox();
        return {
          nodes: nodes,
          viewport: viewport
        };
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return DAGMinimapCtrl;
  }();

  angular.module(PKG.name + '.commons').controller('DAGMinimapCtrl', DAGMinimapCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /dag-minimap/dag-minimap-utilities.js */

  /*
   * Copyright © 2019 Cask Data, Inc.
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
  var DAGMinimapUtilities = /*#__PURE__*/function () {
    function DAGMinimapUtilities() {
      _classCallCheck(this, DAGMinimapUtilities);

      this.SIZE = {
        height: 150,
        width: 250,
        nodeWidth: 200,
        nodeHeight: 100,
        conditionNode: 105,
        padding: 5
      };
      this.MIN_SCALE = 0.5;
    }

    _createClass(DAGMinimapUtilities, [{
      key: "getGraphMetadata",
      value: function getGraphMetadata(nodes) {
        // Get min/max of nodes
        var minX = null,
            maxX = null,
            minY = null,
            maxY = null;
        nodes.forEach(function (node) {
          if (!node._uiPosition) {
            return;
          }

          var position = node._uiPosition;
          var x = parseInt(position.left, 10);
          var y = parseInt(position.top, 10);
          minX = minX === null ? x : Math.min(minX, x);
          maxX = maxX === null ? x : Math.max(maxX, x);
          minY = minY === null ? y : Math.min(minY, y);
          maxY = maxY === null ? y : Math.max(maxY, y);
        });
        var width = 0;
        var height = 0;

        if (minX !== null && maxX !== null && minY !== null && maxY !== null) {
          width = Math.abs(maxX + this.SIZE.nodeWidth - minX);
          height = Math.abs(maxY + this.SIZE.nodeHeight - minY);
        }

        var widthScale = this.SIZE.width / width;
        var heightScale = this.SIZE.height / height;
        var scale = Math.min(widthScale, heightScale, this.MIN_SCALE) || this.MIN_SCALE; // If width and height is less than the minimap size, center the graph.

        var xOffset = 0;
        var yOffset = 0;

        if (width * scale < this.SIZE.width) {
          xOffset = (this.SIZE.width - width * scale) / 2;
        }

        if (height * scale < this.SIZE.height) {
          yOffset = (this.SIZE.height - height * scale) / 2;
        }

        return {
          scale: scale,
          minX: minX,
          minY: minY,
          width: width,
          height: height,
          xOffset: xOffset,
          yOffset: yOffset
        };
      }
    }, {
      key: "getNodeMetadata",
      value: function getNodeMetadata(node, graphMetadata) {
        var scale = graphMetadata.scale,
            minX = graphMetadata.minX,
            minY = graphMetadata.minY,
            xOffset = graphMetadata.xOffset,
            yOffset = graphMetadata.yOffset;
        var height = this.SIZE.nodeHeight;
        var width = this.SIZE.nodeWidth;

        if (node.type === 'condition') {
          height = this.SIZE.conditionNode;
          width = this.SIZE.conditionNode;
        }

        height *= scale;
        width *= scale;
        var position = node._uiPosition;

        if (!position) {
          return {
            height: height,
            width: width,
            left: 0,
            right: 0
          };
        }

        var x = parseInt(position.left, 10) - minX;
        var y = parseInt(position.top, 10) - minY;
        var left = x * scale + xOffset;
        var top = y * scale + yOffset;
        return {
          height: height,
          width: width,
          left: left,
          top: top
        };
      }
      /**
       * Function that will give information about the viewport indicator for minimap
       *
       * @param graphMetadata result from getGraphMetadata function
       * @param dagContainerSize diagram-container getBoundClientRect result (viewport size)
       * @param canvasScale the scale of the actual graph canvas (dag-container)
       * @param canvasPanning the top and left of dag-container
       *
       * Returns the height, width, top, and left property of the viewport for the minimap. The top and left will
       * correlate to the top left point of the viewport.
       */

    }, {
      key: "getViewportBox",
      value: function getViewportBox(graphMetadata, dagContainerSize, canvasScale, canvasPanning) {
        if (!graphMetadata || !dagContainerSize) {
          return;
        }

        var scale = graphMetadata.scale,
            minX = graphMetadata.minX,
            minY = graphMetadata.minY,
            xOffset = graphMetadata.xOffset,
            yOffset = graphMetadata.yOffset; // on empty dag

        if (minX === null || minY === null) {
          var padding = 2 * this.SIZE.padding;
          return {
            height: this.SIZE.height + padding,
            width: this.SIZE.width + padding,
            top: 0,
            left: 0
          };
        }

        var scaleRatio = scale / canvasScale;
        var height = dagContainerSize.height * scaleRatio;
        var width = dagContainerSize.width * scaleRatio;
        var canvasPanningY = canvasPanning.top;
        var canvasPanningX = canvasPanning.left;
        var nodeOffsetY = canvasScale * minY + (1 - canvasScale) / 2 * dagContainerSize.height;
        var nodeOffsetX = canvasScale * minX + (1 - canvasScale) / 2 * dagContainerSize.width;
        var top = (canvasPanningY + nodeOffsetY) * scaleRatio;
        top = -top + yOffset + this.SIZE.padding;
        var left = (canvasPanningX + nodeOffsetX) * scaleRatio;
        left = -left + xOffset + this.SIZE.padding;
        return {
          height: height,
          width: width,
          top: top,
          left: left
        };
      }
      /**
       * Function to transpose location of minimap click to actual panning offset for dag-container
       *
       * @param posX x coordinate of the mouse location within minimap
       * @param posY y coordinate of the mouse location within minimap
       * @param graphMetadata result from getGraphMetadata function
       * @param canvasScale the scale of the actual graph canvas (dag-container)
       *
       * returns the x and y offset for dag-container
       */

    }, {
      key: "getViewportLocation",
      value: function getViewportLocation(posX, posY, graphMetadata, canvasScale) {
        var x = posX - this.SIZE.padding - this.SIZE.width / 2;
        var y = posY - this.SIZE.padding - this.SIZE.height / 2;
        var scale = graphMetadata.scale;
        var trueX = -x / scale * canvasScale;
        var trueY = -y / scale * canvasScale;
        return {
          x: trueX,
          y: trueY
        };
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return DAGMinimapUtilities;
  }();

  angular.module(PKG.name + '.commons').service('DAGMinimapUtilities', DAGMinimapUtilities);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /dag-minimap/dag-minimap.js */

  /*
   * Copyright © 2019 Cask Data, Inc.
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
  var commonModule = angular.module(PKG.name + '.commons');
  commonModule.directive('dagMinimap', function () {
    return {
      restrict: 'E',
      controller: 'DAGMinimapCtrl',
      controllerAs: 'MinimapCtrl',
      templateUrl: 'dag-minimap/dag-minimap.html',
      bindToController: true,
      scope: {
        canvasScale: '=',
        panning: '&'
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /escape-close/escape-close.js */

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
  angular.module(PKG.name + '.commons').directive('myEscapeClose', function () {
    return {
      restrict: 'A',
      link: function link(scope, element, attr) {
        var escExpr = attr.myEscapeClose;
        element.bind('keyup', function (event) {
          if (event.keyCode === 27) {
            scope.$apply(function () {
              scope.$eval(escExpr);
            });
            event.preventDefault();
          }
        });
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /fileselect/fileselect.js */

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
  angular.module(PKG.name + '.commons').directive('myFileSelect', ["$parse", function ($parse) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'fileselect/fileselect.html',
      link: function link(scope, element, attrs) {
        // Enabling Customizability.
        scope.buttonLabel = attrs.buttonLabel || 'Upload';
        scope.buttonIcon = attrs.buttonIcon || 'fa-plus';
        scope.buttonClass = attrs.buttonClass || '';
        scope.buttonDisabled = attrs.buttonDisabled === 'true';
        attrs.$observe('buttonDisabled', function () {
          scope.buttonDisabled = attrs.buttonDisabled === 'true';
        });

        if (attrs.dropdown === undefined) {
          attrs.dropdown = false;
        }

        scope.isDropdown = attrs.dropdown;
        var fileElement = angular.element('<input class="sr-only" type="file" accept=".json">');
        element.append(fileElement);
        element.bind('click', function () {
          fileElement[0].click();
        });
        var onFileSelect = $parse(attrs.onFileSelect);
        fileElement.bind('change', function (e) {
          onFileSelect(scope, {
            $files: e.target.files
          }); // If upload fails and if the same file is uploaded again (fixed file)
          // the onchange will not be triggered. This is to enable that.

          this.value = null;
        });
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /focus-watch/focus-watch.js */

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
  angular.module(PKG.name + '.commons').directive('myFocusWatch', ["$timeout", function ($timeout) {
    return {
      scope: {
        model: '=myFocusWatch'
      },
      link: function link(scope, element) {
        var focusTimeout = null;
        scope.$watch('model', function () {
          if (scope.model) {
            if (focusTimeout) {
              $timeout.cancel(focusTimeout);
            }

            focusTimeout = $timeout(function () {
              element[0].focus();
            });
          }
        });
        scope.$on('$destroy', function () {
          if (focusTimeout) {
            $timeout.cancel(focusTimeout);
          }
        });
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /group-side-panel/group-side-panel-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('MySidePanel', ["$scope", "AvailablePluginsStore", "$filter", "myHelpers", function ($scope, AvailablePluginsStore, $filter, myHelpers) {
    var _this = this;

    this.groups = $scope.panelGroups;
    this.groupGenericName = $scope.groupGenericName || 'group';
    this.itemGenericName = $scope.itemGenericName || 'item';
    var myRemoveCamelCase = $filter('myRemoveCamelcase');
    this.pluginsMap = {};
    this.view = $scope.view || 'icon';
    $scope.$watch('MySidePanel.groups.length', function () {
      if (this.groups.length) {
        this.openedGroup = this.groups[0].name;
      }
      /*
        42 = height of the each group's header
        (-42) = height of the current wrapper(group's) header height. We need to include that in the height of the group's wrapper.
        This is has to be through ng-style as the #of groups we might have could be dynamic and having to fit all in one specific
        height needs this calculation.
         FIXME: This will not scale i.e., non-reusable.
       */


      this.groupWrapperHeight = 'calc(100% - ' + (this.groups.length * 35 - 35 - 1) + 'px)';
    }.bind(this));

    this.onItemClicked = function (event, item) {
      event.stopPropagation();
      event.preventDefault();
      var fn = $scope.onPanelItemClick();

      if ('undefined' !== typeof fn) {
        fn.call($scope.onPanelItemClickContext, event, item);
      }
    };

    function generatePluginMapKey(plugin) {
      var name = plugin.name,
          type = plugin.type,
          artifact = plugin.artifact;

      if (plugin.pluginTemplate) {
        name = plugin.pluginName;
        type = plugin.pluginType;
      }

      return "".concat(name, "-").concat(type, "-").concat(artifact.name, "-").concat(artifact.version, "-").concat(artifact.scope);
    }

    this.generateLabel = function (plugin) {
      if (plugin.pluginTemplate) {
        return plugin.name;
      }

      var key = generatePluginMapKey(plugin);
      var displayName = myHelpers.objectQuery(_this.pluginsMap, key, 'widgets', 'display-name');
      displayName = displayName || myRemoveCamelCase(plugin.name);
      return displayName;
    };

    this.shouldShowCustomIcon = function (plugin) {
      var key = generatePluginMapKey(plugin);
      var iconSourceType = myHelpers.objectQuery(_this.pluginsMap, key, 'widgets', 'icon', 'type');
      return ['inline', 'link'].indexOf(iconSourceType) !== -1;
    };

    this.getCustomIconSrc = function (plugin) {
      var key = generatePluginMapKey(plugin);
      var iconSourceType = myHelpers.objectQuery(_this.pluginsMap, key, 'widgets', 'icon', 'type');

      if (iconSourceType === 'inline') {
        return myHelpers.objectQuery(_this.pluginsMap, key, 'widgets', 'icon', 'arguments', 'data');
      }

      return myHelpers.objectQuery(_this.pluginsMap, key, 'widgets', 'icon', 'arguments', 'url');
    };

    this.getFilteredPluginsFromGroup = function (group) {
      var trimmedSearchText = _this.searchText ? _this.searchText.trim().toLowerCase() : null;

      var containsTerm = function containsTerm(field, term) {
        if (!field) {
          return false;
        }

        return field.toLowerCase().indexOf(term) > -1;
      };

      if (!trimmedSearchText || !trimmedSearchText.length) {
        return group.plugins;
      }

      return group.plugins.filter(function (plugin) {
        return containsTerm(plugin.name, trimmedSearchText) || containsTerm(plugin.label, trimmedSearchText) || containsTerm(_this.generateLabel(plugin), trimmedSearchText);
      });
    };

    var sub = AvailablePluginsStore.subscribe(function () {
      _this.pluginsMap = AvailablePluginsStore.getState().plugins.pluginsMap;
    });
    $scope.$on('$destroy', function () {
      sub();
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /group-side-panel/group-side-panel.js */

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
  angular.module(PKG.name + '.commons').directive('mySidePanel', function () {
    return {
      restrict: 'E',
      scope: {
        panelGroups: '=',
        view: '=',
        groupGenericName: '@',
        itemGenericName: '@',
        onAdd: '&',
        onPanelItemClick: '&',
        onPanelItemClickContext: '='
      },
      templateUrl: 'group-side-panel/group-side-panel.html',
      controller: 'MySidePanel',
      controllerAs: 'MySidePanel'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /infinite-scroll/infinite-scroll.js */

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
  angular.module(PKG.name + '.commons').directive('infiniteScroll', ["$timeout", function ($timeout) {
    return {
      restrict: 'A',
      link: function link(scope, elem, attrs) {
        // wrapping in timeout to have content loaded first and setting the scroll to the top
        var timeout = $timeout(function () {
          elem.prop('scrollTop', 10);
          elem.bind('scroll', _.debounce(scrollListener, 1000));
        }, 100);

        function scrollListener() {
          if (elem.prop('scrollTop') + elem.prop('offsetHeight') >= elem.prop('scrollHeight')) {
            scope.$apply(attrs.infiniteScrollNext);
          } else if (elem.prop('scrollTop') === 0) {
            scope.$apply(attrs.infiniteScrollPrev);
          }
        }

        scope.$on('$destroy', function () {
          elem.unbind('scroll');
          $timeout.cancel(timeout);
        });
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /macro-widget-toggle/macro-widget-toggle.js */

  /*
   * Copyright © 2017 - 2018 Cask Data, Inc.
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
  MacroWidgetToggleController.$inject = ["myHelpers", "$timeout", "$scope", "HydratorPlusPlusHydratorService"];
  function MacroWidgetToggleController(myHelpers, $timeout, $scope, HydratorPlusPlusHydratorService) {
    var vm = this;
    vm.isMacro = false;
    var timeout;
    vm.editorTypeWidgets = ['scala-editor', 'javascript-editor', 'python-editor', 'sql-editor'];
    vm.otherAceEditorWidgets = ['wrangler-directives', 'textarea', 'rules-engine-editor'];
    vm.containsMacro = false; // This function will check if the entire value is a macro.
    // If it is, then change to macro editor.
    // If the value is only partially a macro, only show the background indicator.

    function checkMacro(value) {
      if (!value || !value.length) {
        return false;
      }

      var beginChar = value.indexOf('${') === 0;
      var endingChar = value.charAt(value.length - 1) === '}';
      vm.containsMacro = HydratorPlusPlusHydratorService.containsMacro(value);
      return beginChar && endingChar;
    }

    vm.toggleMacro = function () {
      if (vm.disabled) {
        return;
      }

      var newValue = !vm.isMacro;
      var propertyValue = myHelpers.objectQuery(vm.node, 'plugin', 'properties', vm.field.name);

      if (!newValue) {
        vm.node.plugin.properties[vm.field.name] = '';
        vm.containsMacro = false;
      } else if (!HydratorPlusPlusHydratorService.containsMacro(propertyValue)) {
        vm.node.plugin.properties[vm.field.name] = '${}';
        $timeout.cancel(timeout);
        timeout = $timeout(function () {
          var elem = document.getElementById("macro-input-".concat(vm.field.name));
          angular.element(elem)[0].focus();

          if (elem.createRange) {
            var range = elem.createRange();
            range.move('character', 2);
            range.select();
          } else {
            elem.setSelectionRange(2, 2);
          }
        });
      }

      vm.isMacro = newValue;
    };

    function init() {
      // check if value is macro or not. If it is, set isMacro to true
      var propertyValue = myHelpers.objectQuery(vm.node, 'plugin', 'properties', vm.field.name);
      var isMacroSupported = myHelpers.objectQuery(vm, 'node', '_backendProperties', vm.field.name, 'macroSupported');

      if (isMacroSupported) {
        vm.isMacro = checkMacro(propertyValue);
      }
    }

    vm.onChange = function (value) {
      vm.node.plugin.properties[vm.field.name] = value;
    };

    init();
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('macroWidgetToggle', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'macro-widget-toggle/macro-widget-toggle.html',
      bindToController: true,
      scope: {
        node: '=',
        field: '=',
        disabled: '='
      },
      controller: MacroWidgetToggleController,
      controllerAs: 'MacroWidget'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /modified-tooltip/tooltip.js */

  /*
   * Copyright © 2020 Cask Data, Inc.
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

  /**
   * The MIT License
  
  Copyright (c) 2012-2014 Olivier Louvignes http://olouv.com
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
  angular.module(PKG.name + '.commons').provider('$modifiedTooltip', function () {
    var defaults = this.defaults = {
      animation: 'am-fade',
      customClass: '',
      prefixClass: 'tooltip',
      prefixEvent: 'tooltip',
      container: false,
      target: false,
      placement: 'top',
      templateUrl: 'modified-tooltip/tooltip.html',
      template: '',
      titleTemplate: false,
      trigger: 'hover focus',
      keyboard: false,
      html: false,
      show: false,
      title: '',
      type: '',
      delay: 0,
      autoClose: false,
      bsEnabled: true,
      mouseDownPreventDefault: true,
      mouseDownStopPropagation: true,
      viewport: {
        selector: 'body',
        padding: 0
      }
    };

    this.$get = ["$window", "$rootScope", "$bsCompiler", "$animate", "$sce", "dimensions", "$$rAF", "$timeout", function ($window, $rootScope, $bsCompiler, $animate, $sce, dimensions, $$rAF, $timeout) {
      var isNative = /(ip[ao]d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = 'createTouch' in $window.document && isNative;
      var $body = angular.element($window.document);

      function TooltipFactory(element, config) {
        var $tooltip = {}; // Common vars

        var options = $tooltip.$options = angular.extend({}, defaults, config);
        var promise = $tooltip.$promise = $bsCompiler.compile(options);
        var scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        var nodeName = element[0].nodeName.toLowerCase();

        if (options.delay && angular.isString(options.delay)) {
          var split = options.delay.split(',').map(parseFloat);
          options.delay = split.length > 1 ? {
            show: split[0],
            hide: split[1]
          } : split[0];
        } // Store $id to identify the triggering element in events
        // give priority to options.id, otherwise, try to use
        // element id if defined


        $tooltip.$id = options.id || element.attr('id') || ''; // Support scope as string options

        if (options.title) {
          scope.title = $sce.trustAsHtml(options.title);
        } // Provide scope helpers


        scope.$setEnabled = function (isEnabled) {
          scope.$$postDigest(function () {
            $tooltip.setEnabled(isEnabled);
          });
        };

        scope.$hide = function () {
          scope.$$postDigest(function () {
            $tooltip.hide();
          });
        };

        scope.$show = function () {
          scope.$$postDigest(function () {
            $tooltip.show();
          });
        };

        scope.$toggle = function () {
          scope.$$postDigest(function () {
            $tooltip.toggle();
          });
        }; // Publish isShown as a protected var on scope


        $tooltip.$isShown = scope.$isShown = false; // Private vars

        var timeout;
        var hoverState; // Fetch, compile then initialize tooltip

        var compileData;
        var tipElement;
        var tipContainer;
        var tipScope;
        promise.then(function (data) {
          compileData = data;
          $tooltip.init();
        });

        $tooltip.init = function () {
          // Options: delay
          if (options.delay && angular.isNumber(options.delay)) {
            options.delay = {
              show: options.delay,
              hide: options.delay
            };
          } // Replace trigger on touch devices ?
          // if(isTouch && options.trigger === defaults.trigger) {
          //   options.trigger.replace(/hover/g, 'click');
          // }
          // Options : container


          if (options.container === 'self') {
            tipContainer = element;
          } else if (angular.isElement(options.container)) {
            tipContainer = options.container;
          } else if (options.container) {
            tipContainer = findElement(options.container);
          } // Options: trigger


          bindTriggerEvents(); // Options: target

          if (options.target) {
            options.target = angular.isElement(options.target) ? options.target : findElement(options.target);
          } // Options: show


          if (options.show) {
            scope.$$postDigest(function () {
              if (options.trigger === 'focus') {
                element[0].focus();
              } else {
                $tooltip.show();
              }
            });
          }
        };

        $tooltip.destroy = function () {
          // Unbind events
          unbindTriggerEvents(); // Remove element

          destroyTipElement(); // Destroy scope

          scope.$destroy();
        };

        $tooltip.enter = function () {
          clearTimeout(timeout);
          hoverState = 'in';

          if (!options.delay || !options.delay.show) {
            return $tooltip.show();
          }

          timeout = setTimeout(function () {
            if (hoverState === 'in') {
              $tooltip.show();
            }
          }, options.delay.show);
        };

        $tooltip.show = function () {
          if (!options.bsEnabled || $tooltip.$isShown) {
            return;
          }

          scope.$emit(options.prefixEvent + '.show.before', $tooltip);

          if (angular.isDefined(options.onBeforeShow) && angular.isFunction(options.onBeforeShow)) {
            options.onBeforeShow($tooltip);
          }

          var parent;
          var after;

          if (options.container) {
            parent = tipContainer;

            if (tipContainer[0].lastChild) {
              after = angular.element(tipContainer[0].lastChild);
            } else {
              after = null;
            }
          } else {
            parent = null;
            after = element;
          } // Hide any existing tipElement


          if (tipElement) {
            destroyTipElement();
          } // Fetch a cloned element linked from template


          tipScope = $tooltip.$scope.$new();
          tipElement = $tooltip.$element = compileData.link(tipScope, function () {}); // Set the initial positioning.  Make the tooltip invisible
          // so IE doesn't try to focus on it off screen.

          tipElement.css({
            top: '-9999px',
            left: '-9999px',
            right: 'auto',
            display: 'block',
            visibility: 'hidden'
          }); // Options: animation

          if (options.animation) {
            tipElement.addClass(options.animation);
          } // Options: type


          if (options.type) {
            tipElement.addClass(options.prefixClass + '-' + options.type);
          } // Options: custom classes


          if (options.customClass) {
            tipElement.addClass(options.customClass);
          } // Append the element, without any animations.  If we append
          // using $animate.enter, some of the animations cause the placement
          // to be off due to the transforms.


          if (after) {
            after.after(tipElement);
          } else {
            parent.prepend(tipElement);
          }

          $tooltip.$isShown = scope.$isShown = true;
          /* jshint ignore:start */

          safeDigest(scope);
          /* jshint ignore:end */
          // Now, apply placement

          $tooltip.$applyPlacement(); // Once placed, animate it.
          // Support v1.2+ $animate
          // https://github.com/angular/angular.js/issues/11713

          if (angular.version.minor <= 2) {
            $animate.enter(tipElement, parent, after, enterAnimateCallback);
          } else {
            $animate.enter(tipElement, parent, after).then(enterAnimateCallback);
          }
          /* jshint ignore:start */


          safeDigest(scope);
          /* jshint ignore:end */

          $$rAF(function () {
            // Once the tooltip is placed and the animation starts, make the tooltip visible
            if (tipElement) {
              tipElement.css({
                visibility: 'visible'
              });
            } // Bind events


            if (options.keyboard) {
              if (options.trigger !== 'focus') {
                $tooltip.focus();
              }

              bindKeyboardEvents();
            }
          });

          if (options.autoClose) {
            bindAutoCloseEvents();
          }
        };

        function enterAnimateCallback() {
          scope.$emit(options.prefixEvent + '.show', $tooltip);

          if (angular.isDefined(options.onShow) && angular.isFunction(options.onShow)) {
            options.onShow($tooltip);
          }
        }

        $tooltip.leave = function () {
          clearTimeout(timeout);
          hoverState = 'out';

          if (!options.delay || !options.delay.hide) {
            return $tooltip.hide();
          }

          timeout = setTimeout(function () {
            if (hoverState === 'out') {
              $tooltip.hide();
            }
          }, options.delay.hide);
        };

        var _blur;

        var _tipToHide;

        $tooltip.hide = function (blur) {
          if (!$tooltip.$isShown) {
            return;
          }

          scope.$emit(options.prefixEvent + '.hide.before', $tooltip);

          if (angular.isDefined(options.onBeforeHide) && angular.isFunction(options.onBeforeHide)) {
            options.onBeforeHide($tooltip);
          } // store blur value for leaveAnimateCallback to use


          _blur = blur; // store current tipElement reference to use
          // in leaveAnimateCallback

          _tipToHide = tipElement;

          if (tipElement !== null) {
            // Support v1.2+ $animate
            // https://github.com/angular/angular.js/issues/11713
            if (angular.version.minor <= 2) {
              $animate.leave(tipElement, leaveAnimateCallback);
            } else {
              $animate.leave(tipElement).then(leaveAnimateCallback);
            }
          }

          $tooltip.$isShown = scope.$isShown = false;
          /* jshint ignore:start */

          safeDigest(scope);
          /* jshint ignore:end */
          // Unbind events

          if (options.keyboard && tipElement !== null) {
            unbindKeyboardEvents();
          }

          if (options.autoClose && tipElement !== null) {
            unbindAutoCloseEvents();
          }
        };

        function leaveAnimateCallback() {
          scope.$emit(options.prefixEvent + '.hide', $tooltip);

          if (angular.isDefined(options.onHide) && angular.isFunction(options.onHide)) {
            options.onHide($tooltip);
          } // check if current tipElement still references
          // the same element when hide was called


          if (tipElement === _tipToHide) {
            // Allow to blur the input when hidden, like when pressing enter key
            if (_blur && options.trigger === 'focus') {
              return element[0].blur();
            } // clean up child scopes


            destroyTipElement();
          }
        }

        $tooltip.toggle = function (evt) {
          if (evt) {
            evt.preventDefault();
          }

          if ($tooltip.$isShown) {
            $tooltip.leave();
          } else {
            $tooltip.enter();
          }
        };

        $tooltip.focus = function () {
          if (tipElement) {
            tipElement[0].focus();
          }
        };

        $tooltip.setEnabled = function (isEnabled) {
          options.bsEnabled = isEnabled;
        };

        $tooltip.setViewport = function (viewport) {
          options.viewport = viewport;
        }; // Protected methods


        $tooltip.$applyPlacement = function () {
          if (!tipElement) {
            return;
          } // Determine if we're doing an auto or normal placement


          var placement = options.placement;
          var autoToken = /\s?auto?\s?/i;
          var autoPlace = autoToken.test(placement);

          if (autoPlace) {
            placement = placement.replace(autoToken, '') || defaults.placement;
          } // Need to add the position class before we get
          // the offsets


          tipElement.addClass(options.placement); // Get the position of the target element
          // and the height and width of the tooltip so we can center it.

          var elementPosition = getPosition();
          var tipWidth = tipElement.prop('offsetWidth');
          var tipHeight = tipElement.prop('offsetHeight'); // Refresh viewport position

          $tooltip.$viewport = options.viewport && findElement(options.viewport.selector || options.viewport); // If we're auto placing, we need to check the positioning

          if (autoPlace) {
            var originalPlacement = placement;
            var viewportPosition = getPosition($tooltip.$viewport);

            if (/bottom/.test(originalPlacement) && elementPosition.bottom + tipHeight > viewportPosition.bottom) {
              placement = originalPlacement.replace('bottom', 'top');
            } else if (/top/.test(originalPlacement) && elementPosition.top - tipHeight < viewportPosition.top) {
              placement = originalPlacement.replace('top', 'bottom');
            }

            if (/left/.test(originalPlacement) && elementPosition.left - tipWidth < viewportPosition.left) {
              placement = placement.replace('left', 'right');
            } else if (/right/.test(originalPlacement) && elementPosition.right + tipWidth > viewportPosition.width) {
              placement = placement.replace('right', 'left');
            }

            tipElement.removeClass(originalPlacement).addClass(placement);
          } // Get the tooltip's top and left coordinates to center it with this directive.


          var tipPosition = getCalculatedOffset(placement, elementPosition, tipWidth, tipHeight);
          applyPlacement(tipPosition, placement);
        };

        $tooltip.$onKeyUp = function (evt) {
          if (evt.which === 27 && $tooltip.$isShown) {
            $tooltip.hide();
            evt.stopPropagation();
          }
        };

        $tooltip.$onFocusKeyUp = function (evt) {
          if (evt.which === 27) {
            element[0].blur();
            evt.stopPropagation();
          }
        };

        $tooltip.$onFocusElementMouseDown = function (evt) {
          if (options.mouseDownPreventDefault) {
            evt.preventDefault();
          }

          if (options.mouseDownStopPropagation) {
            evt.stopPropagation();
          } // Some browsers do not auto-focus buttons (eg. Safari)


          if ($tooltip.$isShown) {
            element[0].blur();
          } else {
            element[0].focus();
          }
        }; // bind/unbind events


        function bindTriggerEvents() {
          var triggers = options.trigger.split(' ');
          angular.forEach(triggers, function (trigger) {
            if (trigger === 'click' || trigger === 'contextmenu') {
              element.on(trigger, $tooltip.toggle);
            } else if (trigger !== 'manual') {
              element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
              element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);

              if (nodeName === 'button' && trigger !== 'hover') {
                element.on(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }
            }
          });
        }

        function unbindTriggerEvents() {
          var triggers = options.trigger.split(' ');

          for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger === 'click' || trigger === 'contextmenu') {
              element.off(trigger, $tooltip.toggle);
            } else if (trigger !== 'manual') {
              element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
              element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);

              if (nodeName === 'button' && trigger !== 'hover') {
                element.off(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }
            }
          }
        }

        function bindKeyboardEvents() {
          if (options.trigger !== 'focus' && tipElement) {
            tipElement.on('keyup', $tooltip.$onKeyUp);
          } else {
            element.on('keyup', $tooltip.$onFocusKeyUp);
          }
        }

        function unbindKeyboardEvents() {
          if (options.trigger !== 'focus') {
            tipElement.off('keyup', $tooltip.$onKeyUp);
          } else {
            element.off('keyup', $tooltip.$onFocusKeyUp);
          }
        }

        var _autoCloseEventsBinded = false;

        function bindAutoCloseEvents() {
          // use timeout to hookup the events to prevent
          // event bubbling from being processed imediately.
          $timeout(function () {
            // Stop propagation when clicking inside tooltip
            if (tipElement !== null) {
              tipElement.on('click', stopEventPropagation);
            } // Hide when clicking outside tooltip


            $body.on('click', $tooltip.hide);
            _autoCloseEventsBinded = true;
          }, 0, false);
        }

        function unbindAutoCloseEvents() {
          if (_autoCloseEventsBinded) {
            tipElement.off('click', stopEventPropagation);
            $body.off('click', $tooltip.hide);
            _autoCloseEventsBinded = false;
          }
        }

        function stopEventPropagation(event) {
          event.stopPropagation();
        } // Private methods


        function getPosition($element) {
          $element = $element || options.target || element;
          var el = $element[0];
          var isBody = el.tagName === 'BODY';
          var elRect = el.getBoundingClientRect();
          var rect = {}; // IE8 has issues with angular.extend and using elRect directly.
          // By coping the values of elRect into a new object, we can continue to use extend

          /* eslint-disable guard-for-in */

          /* jshint ignore:start */

          for (var p in elRect) {
            // eslint-disable-line
            // DO NOT use hasOwnProperty when inspecting the return of getBoundingClientRect.
            rect[p] = elRect[p];
          }
          /* jshint ignore:end */

          /* eslint-enable guard-for-in */


          if (rect.width === null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            rect = angular.extend({}, rect, {
              width: elRect.right - elRect.left,
              height: elRect.bottom - elRect.top
            });
          }

          var elOffset = isBody ? {
            top: 0,
            left: 0
          } : dimensions.offset(el);
          var scroll = {
            scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.prop('scrollTop') || 0
          };
          var outerDims = isBody ? {
            width: document.documentElement.clientWidth,
            height: $window.innerHeight
          } : null;
          return angular.extend({}, rect, scroll, outerDims, elOffset);
        }

        function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
          var offset;
          var split = placement.split('-');

          switch (split[0]) {
            case 'right':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left + position.width
              };
              break;

            case 'bottom':
              offset = {
                top: position.top + position.height,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;

            case 'left':
              offset = {
                top: position.top + position.height / 2 - actualHeight / 2,
                left: position.left - actualWidth
              };
              break;

            default:
              offset = {
                top: position.top - actualHeight,
                left: position.left + position.width / 2 - actualWidth / 2
              };
              break;
          }

          if (!split[1]) {
            return offset;
          } // Add support for corners @todo css


          if (split[0] === 'top' || split[0] === 'bottom') {
            switch (split[1]) {
              case 'left':
                offset.left = position.left;
                break;

              case 'right':
                offset.left = position.left + position.width - actualWidth;
                break;

              default:
                break;
            }
          } else if (split[0] === 'left' || split[0] === 'right') {
            switch (split[1]) {
              case 'top':
                offset.top = position.top - actualHeight + position.height;
                break;

              case 'bottom':
                offset.top = position.top;
                break;

              default:
                break;
            }
          }

          return offset;
        }

        function applyPlacement(offset, placement) {
          if (!tipElement) {
            return;
          }

          var tip = tipElement[0];
          var width = tip.offsetWidth;
          var height = tip.offsetHeight; // manually read margins because getBoundingClientRect includes difference

          var marginTop = parseInt(dimensions.css(tip, 'margin-top'), 10);
          var marginLeft = parseInt(dimensions.css(tip, 'margin-left'), 10); // we must check for NaN for ie 8/9

          if (isNaN(marginTop)) {
            marginTop = 0;
          }

          if (isNaN(marginLeft)) {
            marginLeft = 0;
          }

          offset.top = offset.top + marginTop;
          offset.left = offset.left + marginLeft; // dimensions setOffset doesn't round pixel values
          // so we use setOffset directly with our own function

          dimensions.setOffset(tip, angular.extend({
            using: function using(props) {
              tipElement.css({
                top: Math.round(props.top) + 'px',
                left: Math.round(props.left) + 'px',
                right: ''
              });
            }
          }, offset), 0); // check to see if placing tip in new offset caused the tip to resize itself

          var actualWidth = tip.offsetWidth;
          var actualHeight = tip.offsetHeight;

          if (placement === 'top' && actualHeight !== height) {
            offset.top = offset.top + height - actualHeight;
          } // If it's an exotic placement, exit now instead of
          // applying a delta and changing the arrow


          if (/top-left|top-right|bottom-left|bottom-right/.test(placement)) {
            return;
          }

          var delta = getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

          if (delta.left) {
            offset.left += delta.left;
          } else {
            offset.top += delta.top;
          }

          dimensions.setOffset(tip, offset);

          if (/top|right|bottom|left/.test(placement)) {
            var isVertical = /top|bottom/.test(placement);
            var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
            var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
            replaceArrow(arrowDelta, tip[arrowOffsetPosition], isVertical);
          }
        } // @source https://github.com/twbs/bootstrap/blob/v3.3.5/js/tooltip.js#L380


        function getViewportAdjustedDelta(placement, position, actualWidth, actualHeight) {
          var delta = {
            top: 0,
            left: 0
          };

          if (!$tooltip.$viewport) {
            return delta;
          }

          var viewportPadding = options.viewport && options.viewport.padding || 0;
          var viewportDimensions = getPosition($tooltip.$viewport);

          if (/right|left/.test(placement)) {
            var topEdgeOffset = position.top - viewportPadding - viewportDimensions.scroll;
            var bottomEdgeOffset = position.top + viewportPadding - viewportDimensions.scroll + actualHeight;

            if (topEdgeOffset < viewportDimensions.top) {
              // top overflow
              delta.top = viewportDimensions.top - topEdgeOffset;
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
              // bottom overflow
              delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
            }
          } else {
            var leftEdgeOffset = position.left - viewportPadding;
            var rightEdgeOffset = position.left + viewportPadding + actualWidth;

            if (leftEdgeOffset < viewportDimensions.left) {
              // left overflow
              delta.left = viewportDimensions.left - leftEdgeOffset;
            } else if (rightEdgeOffset > viewportDimensions.right) {
              // right overflow
              delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
            }
          }

          return delta;
        }

        function replaceArrow(delta, dimension, isHorizontal) {
          var $arrow = findElement('.tooltip-arrow, .arrow', tipElement[0]);
          $arrow.css(isHorizontal ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isHorizontal ? 'top' : 'left', '');
        }

        function destroyTipElement() {
          // Cancel pending callbacks
          clearTimeout(timeout);

          if ($tooltip.$isShown && tipElement !== null) {
            if (options.autoClose) {
              unbindAutoCloseEvents();
            }

            if (options.keyboard) {
              unbindKeyboardEvents();
            }
          }

          if (tipScope) {
            tipScope.$destroy();
            tipScope = null;
          }

          if (tipElement) {
            tipElement.remove();
            tipElement = $tooltip.$element = null;
          }
        }

        return $tooltip;
      } // Helper functions

      /* jshint ignore:start */


      function safeDigest(scope) {
        /* eslint-disable no-unused-expressions */
        scope.$$phase || scope.$root && scope.$root.$$phase || scope.$digest();
        /* eslint-enable no-unused-expressions */
      }
      /* jshint ignore:end */


      function findElement(query, element) {
        return angular.element((element || document).querySelectorAll(query));
      }

      return TooltipFactory;
    }];
  }).provider('$modifiedPopover', function () {
    var defaults = this.defaults = {
      animation: 'am-fade',
      customClass: '',
      // uncommenting the next two lines will break backwards compatability
      // prefixClass: 'popover',
      // prefixEvent: 'popover',
      container: false,
      target: false,
      placement: 'right',
      templateUrl: 'modified-tooltip/popover.html',
      contentTemplate: false,
      trigger: 'click',
      keyboard: true,
      html: false,
      title: '',
      content: '',
      delay: 0,
      autoClose: false
    };

    this.$get = ["$modifiedTooltip", function ($modifiedTooltip) {
      function PopoverFactory(element, config) {
        // Common vars
        var options = angular.extend({}, defaults, config);
        var $popover = $modifiedTooltip(element, options); // Support scope as string options [/*title, */content]

        if (options.content) {
          $popover.$scope.content = options.content;
        }

        return $popover;
      }

      return PopoverFactory;
    }];
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-pipeline-configurations-factory.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').factory('MyPipelineConfigFactory', function () {
    var attributes = {
      'runtime-arguments': 'runtimeArguments',
      'resolved-macros': 'resolvedMacros',
      'apply-runtime-arguments': 'applyRuntimeArguments()',
      'pipeline-name': '{{::pipelineName}}',
      'pipeline-action': '{{::pipelineAction}}',
      'run-pipeline': 'runPipeline()',
      'on-close': 'onClose()',
      'namespace': 'namespace',
      'store': 'store',
      'action-creator': 'actionCreator',
      'is-deployed': 'isDeployed',
      'show-preview-config': 'showPreviewConfig'
    };
    var batchPipelineConfig = {
      'element': '<my-batch-pipeline-config></my-batch-pipeline-config>',
      'attributes': attributes
    };
    var realtimePipelineConfig = {
      'element': '<my-realtime-pipeline-config></my-realtime-pipeline-config>',
      'attributes': attributes
    };
    var sqlPipelineConfig = {
      'element': '<my-sql-pipeline-config></my-sql-pipeline-config>',
      'attributes': attributes
    };
    return {
      'cdap-etl-batch': batchPipelineConfig,
      'cdap-data-pipeline': batchPipelineConfig,
      'cdap-data-streams': realtimePipelineConfig,
      'cdap-etl-realtime': realtimePipelineConfig,
      'cdap-sql-pipeline': sqlPipelineConfig
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-configurations/my-pipeline-configurations.js */

  /*
  * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myPipelineConfig', ["MyPipelineConfigFactory", "$compile", function (MyPipelineConfigFactory, $compile) {
    return {
      restrict: 'A',
      scope: {
        runtimeArguments: '=',
        resolvedMacros: '=',
        applyRuntimeArguments: '&',
        pipelineName: '@',
        pipelineAction: '@',
        runPipeline: '&',
        onClose: '&',
        namespace: '@namespaceId',
        store: '=',
        actionCreator: '=',
        templateType: '@',
        isDeployed: '=',
        showPreviewConfig: '='
      },
      replace: false,
      link: function link(scope, element) {
        var angularElement, widget;
        element.removeAttr('my-pipeline-config');
        widget = MyPipelineConfigFactory[scope.templateType];

        if (!widget) {
          return;
        }

        angularElement = angular.element(widget.element);
        angular.forEach(widget.attributes, function (value, key) {
          angularElement.attr(key, value);
        });
        var content = $compile(angularElement)(scope);
        element.append(content);
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-scheduler/my-pipeline-scheduler.js */

  /*
  * Copyright © 2018 Cask Data, Inc.
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
  var MyPipelineSchedulerCtrl = /*#__PURE__*/function () {
    function MyPipelineSchedulerCtrl() {
      _classCallCheck(this, MyPipelineSchedulerCtrl);

      this.schedule = this.store.getSchedule();
      this.maxConcurrentRuns = this.store.getMaxConcurrentRuns();
    }

    _createClass(MyPipelineSchedulerCtrl, [{
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MyPipelineSchedulerCtrl;
  }();

  angular.module(PKG.name + '.commons').controller('MyPipelineSchedulerCtrl', MyPipelineSchedulerCtrl).directive('myPipelineScheduler', function () {
    return {
      restrict: 'E',
      scope: {
        store: '=',
        actionCreator: '=',
        pipelineName: '@',
        onClose: '&',
        anchorEl: '@'
      },
      bindToController: true,
      controller: 'MyPipelineSchedulerCtrl',
      controllerAs: 'SchedulerCtrl',
      templateUrl: 'my-pipeline-scheduler/my-pipeline-scheduler.html'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-runtime-args/my-pipeline-runtime-args.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  var MyPipelineRuntimeArgsCtrl = /*#__PURE__*/function () {
    function MyPipelineRuntimeArgsCtrl() {
      'ngInject';

      _classCallCheck(this, MyPipelineRuntimeArgsCtrl);

      this.providedPopoverOpen = false;
      this.runtimeArguments = this.getRuntimeResolvedArguments(this.checkForReset(this.runtimeArguments));
      this.onRuntimeArgumentsChange = this.onRuntimeArgumentsChange.bind(this);
      this.getResettedRuntimeArgument = this.getResettedRuntimeArgument.bind(this);
      this.checkForReset = this.checkForReset.bind(this);
    }

    _createClass(MyPipelineRuntimeArgsCtrl, [{
      key: "getRuntimeResolvedArguments",
      value: function getRuntimeResolvedArguments(runtimeArguments) {
        var runtimeArgumentsPairs = runtimeArguments.pairs;

        for (var i = 0; i < runtimeArgumentsPairs.length; i++) {
          if (runtimeArgumentsPairs[i].notDeletable) {
            if (runtimeArgumentsPairs[i].provided) {
              runtimeArgumentsPairs[i].showReset = false;
            } else {
              var runtimeArgKey = runtimeArgumentsPairs[i].key;

              if (this.resolvedMacros.hasOwnProperty(runtimeArgKey)) {
                if (this.resolvedMacros[runtimeArgKey] !== runtimeArgumentsPairs[i].value) {
                  runtimeArgumentsPairs[i].value = this.resolvedMacros[runtimeArgKey];
                }
              }
            }
          }
        }

        return runtimeArguments;
      }
    }, {
      key: "onRuntimeArgumentsChange",
      value: function onRuntimeArgumentsChange(changedArgs) {
        var newArgs = changedArgs.length ? changedArgs : [];
        this.runtimeArguments = this.checkForReset({
          pairs: newArgs
        });
      }
    }, {
      key: "getResettedRuntimeArgument",
      value: function getResettedRuntimeArgument(index) {
        var runtimeArgKey = this.runtimeArguments.pairs[index].key;
        this.runtimeArguments.pairs[index].value = this.resolvedMacros[runtimeArgKey];
        window.CaskCommon.KeyValueStore.dispatch({
          type: window.CaskCommon.KeyValueStoreActions.onUpdate,
          payload: {
            pairs: this.runtimeArguments.pairs
          }
        });
      }
    }, {
      key: "checkForReset",
      value: function checkForReset(runtimeArguments) {
        var _this = this;

        var runtimeArgumentsPairs = runtimeArguments.pairs;
        runtimeArgumentsPairs.forEach(function (item) {
          if (item.notDeletable) {
            if (item.provided) {
              item.showReset = false;
            } else {
              var runtimeArgKey = item.key;

              if (_this.resolvedMacros.hasOwnProperty(runtimeArgKey)) {
                if (_this.resolvedMacros[runtimeArgKey] !== item.value) {
                  item.showReset = true;
                } else {
                  item.showReset = false;
                }
              }
            }
          }
        });
        return runtimeArguments;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MyPipelineRuntimeArgsCtrl;
  }();

  angular.module(PKG.name + '.commons').controller('MyPipelineRuntimeArgsCtrl', MyPipelineRuntimeArgsCtrl);
  angular.module(PKG.name + '.commons').directive('myPipelineRuntimeArgs', function () {
    return {
      restrict: 'E',
      scope: {
        runtimeArguments: '=',
        containsMacros: '=',
        resolvedMacros: '='
      },
      replace: false,
      templateUrl: 'my-pipeline-runtime-args/my-pipeline-runtime-args.html',
      controller: 'MyPipelineRuntimeArgsCtrl',
      controllerAs: 'RuntimeArgsCtrl',
      bindToController: true
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-popover/my-popover.js */

  /*
   * Copyright © 2015-2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myPopover', ["$compile", "$popover", "$timeout", function ($compile, $popover, $timeout) {
    return {
      restrict: 'A',
      scope: {
        template: '=',
        contentData: '=',
        title: '@',
        placement: '@',
        popoverContext: '=',
        customClass: '@'
      },
      link: function link(scope, element) {
        scope.isOpen = false;
        var popoverElement;
        var delayOpenTimer;
        var delayCloseTimer;
        var mypopover;
        var targetElement = angular.element(element);
        targetElement.removeAttr('my-popover');
        targetElement.removeAttr('data-template');
        targetElement.removeAttr('data-placement');
        targetElement.removeAttr('data-title');

        function cancelTimers() {
          if (delayOpenTimer) {
            $timeout.cancel(delayOpenTimer);
          }

          if (delayCloseTimer) {
            $timeout.cancel(delayCloseTimer);
          }
        }

        function delayOpen(delay) {
          cancelTimers();
          scope.contentData.hovering = true;
          delayOpenTimer = $timeout(showPopover, delay);
          return delayOpenTimer;
        }

        function delayClose(delay) {
          cancelTimers();
          delayCloseTimer = $timeout(function () {
            // This could be the case where we didn't show popup (based on some condition). Trying to hide it would give JS error.
            if (!mypopover) {
              return;
            }

            mypopover.hide();
            destroyPopover();
          }, delay);
          return delayCloseTimer;
        }

        function destroyPopover() {
          scope.contentData.hovering = false;

          if (mypopover) {
            mypopover.destroy();
            mypopover = null;
          }
        }

        function createPopover() {
          if (!scope.template || scope.template && !scope.template.length) {
            return;
          }

          mypopover = $popover(targetElement, {
            title: scope.title,
            contentTemplate: scope.template,
            show: false,
            placement: scope.placement || 'right',
            trigger: 'manual',
            container: 'body',
            customClass: 'my-cdap-popover ' + scope.customClass
          });

          if (scope.contentData) {
            mypopover.$scope.contentData = scope.contentData;
          }

          if (scope.popoverContext) {
            mypopover.$scope.popoverContext = scope.popoverContext;
          }

          mypopover.$scope.delayClose = delayClose;
          delayOpen(1000);
          return mypopover.$promise;
        }

        function initPopover() {
          targetElement.on('mouseenter', function () {
            if (!mypopover) {
              /*
                We are not using the promise retuned by createpopover.
                TL;DR - Async delayed rendering(1000ms) + executing stuff in promises' next tick = fucked up.
                 Long version - We already open and close with a delay of 1000ms and promise executes its then handler
                in the next tick. This adds one more delay in opening. By that time the user might have left the
                target element. At that point opening the popover in the next tick makes it stay there forever as
                we have already executed mouse leave at that point in time. that is the reason createPopover function
                actually shows the popover instead of just creating it.
              */
              createPopover();
            } else {
              delayOpen(1000);
            }
          }).on('mouseleave', delayClose.bind(null)).on('click', delayClose.bind(null));
        }

        function showPopover() {
          cancelTimers();
          mypopover.show();
          popoverElement = mypopover.$element;
          popoverElement.on('mouseenter', cancelTimers);
          popoverElement.on('mouseleave', delayClose.bind(null));
        }

        initPopover();
        scope.$on('$destroy', function () {
          destroyPopover();
          cancelTimers();
        });
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /node-metrics/node-metrics.js */

  /*
  * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myNodeMetrics', ["$timeout", function ($timeout) {
    return {
      restrict: 'E',
      templateUrl: 'node-metrics/node-metrics.html',
      scope: {
        onClick: '&',
        node: '=',
        metricsData: '=',
        disabled: '=',
        portName: '='
      },
      controller: ["$scope", function controller($scope) {
        $scope.showLabels = true;
        $scope.timeout = null;
        $scope.$watch('metricsData', function () {
          $scope.timeout = $timeout(function () {
            var nodeElem = document.getElementById($scope.node.id || $scope.node.name);
            var nodeMetricsElem = nodeElem.querySelector(".metrics-content");

            if (nodeMetricsElem && nodeMetricsElem.offsetWidth < nodeMetricsElem.scrollWidth) {
              $scope.showLabels = false;
            }
          });
        }, true);
        $scope.$on('$destroy', function () {
          if ($scope.timeout) {
            $timeout.cancel($scope.timeout);
          }
        });
      }],
      link: function link(scope) {
        scope.onClick = scope.onClick();
      }
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /react-components/index.js */

  /*
   * Copyright © 2017-2019 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('caskHeader', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.AppHeader);
  }]).directive('keyValuePairs', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.KeyValuePairs);
  }]).directive('keyValuePairsMaterial', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.KeyValuePairsMaterial);
  }]).directive('dataprep', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.DataPrepHome);
  }]).directive('caskResourceCenterButton', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.ResourceCenterButton);
  }]).directive('pipelineSummary', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineSummary);
  }]).directive('rulesEngineHome', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.RulesEngineHome);
  }]).directive('pipelineNodeMetricsGraph', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineNodeMetricsGraph);
  }]).directive('statusAlertMessage', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.StatusAlertMessage);
  }]).directive('loadingIndicator', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.LoadingIndicator);
  }]).directive('pipelineTriggersSidebars', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineTriggersSidebars);
  }]).directive('pipelineDetailsTopPanel', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineDetailsTopPanel);
  }]).directive('pipelineScheduler', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineScheduler);
  }]).directive('pipelineDetailsRunLevelInfo', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineDetailsRunLevelInfo);
  }]).directive('globalFooter', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Footer);
  }]).directive('iconSvg', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.IconSVG);
  }]).directive('authRefresher', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.AuthRefresher);
  }]).directive('apiErrorDialog', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.ApiErrorDialog);
  }]).directive('toggleSwitch', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.ToggleSwitch);
  }]).directive('markdown', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Markdown);
  }]).directive('codeEditor', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.CodeEditor);
  }]).directive('jsonEditor', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.JSONEditor);
  }]).directive('textBox', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.TextBox);
  }]).directive('number', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Number);
  }]).directive('csvWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.CSVWidget);
  }]).directive('keyValueWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.KeyValueWidget);
  }]).directive('selectDropdown', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Select);
  }]).directive('keyValueDropdownWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.KeyValueDropdownWidget);
  }]).directive('multipleValuesWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.MultipleValuesWidget);
  }]).directive('functionDropdownAliasWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.FunctionDropdownAlias);
  }]).directive('toggleSwitchWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.ToggleSwitchWidget);
  }]).directive('wranglerEditor', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.WranglerEditor);
  }]).directive('radioGroupWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.RadioGroupWidget);
  }]).directive('multiSelect', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.MultiSelect);
  }]).directive('joinTypeWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.JoinTypeWidget);
  }]).directive('inputFieldDropdown', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.InputFieldDropdown);
  }]).directive('datasetSelectorWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.DatasetSelectorWidget);
  }]).directive('sqlConditionsWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.SqlConditionsWidget);
  }]).directive('functionDropdownAliasWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.FunctionDropdownAlias);
  }]).directive('sqlSelectorWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.SqlSelectorWidget);
  }]).directive('keyValueEncodedWidget', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.KeyValueEncodedWidget);
  }]).directive('configurationGroup', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.ConfigurationGroup);
  }]).directive('widgetWrapper', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.WidgetWrapper);
  }]).directive('loadingSvg', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.LoadingSVG);
  }]).directive('pipelineContextMenu', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineContextMenu);
  }]).directive('pluginContextMenu', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PluginContextMenu);
  }]).directive('selectionBox', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.SelectionBox);
  }]).directive('page404', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Page404);
  }]).directive('page403', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Page403);
  }]).directive('page500', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Page500);
  }]).directive('previewDataView', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PreviewDataView);
  }]).directive('previewLogs', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PreviewLogs);
  }]).directive('schemaEditor', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.SchemaEditor);
  }]).directive('pluginSchemaEditor', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PluginSchemaEditor);
  }]).directive('comment', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Comment);
  }]).directive('pipelineCommentsActionBtn', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.PipelineCommentsActionBtn);
  }]).directive('connectionsBrowser', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.Connections);
  }]).directive('sidePanel', ["reactDirective", function (reactDirective) {
    return reactDirective(window.CaskCommon.SidePanel);
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /splitter-popover/splitter-popover.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('mySplitterPopover', function () {
    return {
      restrict: 'A',
      scope: {
        node: '=',
        ports: '=',
        isDisabled: '=',
        onMetricsClick: '=',
        disableMetricsClick: '=',
        metricsData: '='
      },
      templateUrl: 'splitter-popover/splitter-popover.html',
      controller: ["$scope", function controller($scope) {
        var vm = this;
        vm.ports = $scope.ports;

        var schemasAreDifferent = function schemasAreDifferent(newSchemas, oldSchemas) {
          if (!newSchemas || !oldSchemas || newSchemas.length !== oldSchemas.length) {
            return true;
          }

          for (var i = 0; i < newSchemas.length; i++) {
            if (newSchemas[i].name !== oldSchemas[i].name) {
              return true;
            }
          }

          return false;
        };

        $scope.$watch('ports', function (newValue, oldValue) {
          if (schemasAreDifferent(newValue, oldValue)) {
            vm.ports = $scope.ports;
          }
        });
      }],
      controllerAs: 'SplitterPopoverCtrl'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /timestamp-picker/timestamp.js */

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
  angular.module(PKG.name + '.commons').config(["$datepickerProvider", "$timepickerProvider", function ($datepickerProvider, $timepickerProvider) {
    angular.extend($datepickerProvider.defaults, {
      iconLeft: 'fa fa-chevron-left',
      iconRight: 'fa fa-chevron-right'
    });
    angular.extend($timepickerProvider.defaults, {
      iconUp: 'fa fa-chevron-up',
      iconDown: 'fa fa-chevron-down'
    });
  }]).directive('myTimestampPicker', function () {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {},
      templateUrl: 'timestamp-picker/datetime.html',
      link: function link(scope, element, attrs, ngModel) {
        scope.label = attrs.label || 'Timestamp';

        ngModel.$render = function () {
          scope.timestamp = ngModel.$viewValue;
        };

        scope.$watch('timestamp', function (newVal) {
          ngModel.$setViewValue(newVal);
        });
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /validators/validator-ctrl.js */

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

  /**
   * The format of vm.validationFields:
   *
   * vm.validationFields = {
   *   <field name>:[
   *     {
   *       "fieldName": "<field name>",
   *       "operation": true/false,
   *       "validation": "<validator classname>.<function name>"
   *       "arguments": {
   *         "<argument 1>": <value 1>,
   *         "<argument 2>": <value 2>,
   *         ...
   *       }
   *     },
   *     ...
   *   ]
   * }
   **/
  angular.module(PKG.name + '.commons').controller('MyValidatorsCtrl', ["$scope", "myHydratorValidatorsApi", "EventPipe", "HydratorPlusPlusConfigStore", "myHelpers", "NonStorePipelineErrorFactory", "GLOBALS", "js_beautify", "HydratorPlusPlusHydratorService", "ValidatorFactory", function ($scope, myHydratorValidatorsApi, EventPipe, HydratorPlusPlusConfigStore, myHelpers, NonStorePipelineErrorFactory, GLOBALS, js_beautify, HydratorPlusPlusHydratorService, ValidatorFactory) {
    var vm = this;
    vm.validators = [];
    vm.isRule = true;
    vm.validationFields = $scope.model.validationFields || {};
    vm.functionMap = {};
    vm.nodeLabelError = '';
    var validatorsList;
    var classNameList = []; // We just need to set the input schema as the output schema

    try {
      $scope.inputSchema = JSON.parse($scope.inputSchema[0].schema);
    } catch (e) {
      $scope.inputSchema = {
        fields: []
      };
    }

    $scope.outputSchema = HydratorPlusPlusHydratorService.formatOutputSchema($scope.inputSchema.fields);
    myHydratorValidatorsApi.get().$promise.then(function (res) {
      delete res.$promise;
      delete res.$resolved;
      validatorsList = Object.keys(res).join(', ');
      angular.forEach(res, function (value, key) {
        classNameList.push(value.classname);
        angular.forEach(value.functions, function (v) {
          v.className = value.classname;
          v.validator = key;
          v.validationKey = v.className + '.' + v.name;
          v.displayName = v.name + ' (' + key + ')';
          vm.functionMap[v.validationKey] = v;
        });
        vm.validators = vm.validators.concat(value.functions);
      });

      if (!$scope.model.validationFields) {
        vm.validationFields = ValidatorFactory.initValidationFields($scope.model.properties, vm.functionMap);
      }

      if (!$scope.isDisabled) {
        $scope.$watch(function () {
          return vm.validationFields;
        }, formatValidationRules, true);
      }
    });

    vm.addFieldGroup = function (fieldName) {
      if (vm.validationFields[fieldName]) {
        return;
      }

      vm.validationFields[fieldName] = [];
    };

    vm.removeFieldGroup = function (fieldName) {
      vm.validationFields[fieldName].splice(0, vm.validationFields[fieldName].length);
      delete vm.validationFields[fieldName];
    };

    vm.addRule = function (fieldName) {
      vm.validationFields[fieldName].push({
        fieldName: fieldName,
        operation: true // true === 'AND'

      });
    };

    vm.removeRule = function (fieldName, rule) {
      var index = vm.validationFields[fieldName].indexOf(rule);
      vm.validationFields[fieldName].splice(index, 1);
    };

    function formatValidationRules() {
      if (Object.keys(vm.validationFields).length === 0) {
        return;
      }

      var conditions = '';
      var flattenRulesArrays = [];
      angular.forEach(vm.validationFields, function (value) {
        flattenRulesArrays = flattenRulesArrays.concat(value);
      }); // this will get triggered when user switch the validation rule

      function deleteArguments(value, key) {
        if (validation.arguments.indexOf(key) === -1) {
          delete field.arguments[key];
        }
      }
      /**
       * This block code will go from the last property. It will create an
       * If/Else block. If the next item in the array has AND operation, it
       * will put the current condition in IF block. For OR, it will put the
       * current condition in ELSE block.
       **/


      for (var i = flattenRulesArrays.length - 1; i >= 0; i--) {
        var field = flattenRulesArrays[i]; // skipping the property if there is no function assigned for the property

        if (!field.fieldName || !field.validation) {
          continue;
        } // skipping if the required arguments have not been set


        var validation = vm.functionMap[field.validation];

        if (validation.arguments.length > 1 && (!field.arguments || Object.keys(field.arguments).length !== validation.arguments.length - 1)) {
          continue;
        }

        if (field.arguments) {
          angular.forEach(field.arguments, deleteArguments);
        }

        var emessage = validation.emessage || '';
        emessage = emessage.replace(/<field:1>/g, '" + input.' + field.fieldName + ' + "');
        var currentBlock = '';
        currentBlock = 'if (' + validation.className + '.' + validation.name + '(';
        /*jshint -W083 */

        angular.forEach(validation.arguments, function (val, $index) {
          if ($index !== 0) {
            currentBlock += ', ';
          }

          if (val === '<field:1>') {
            currentBlock += 'input.' + field.fieldName;
          } else {
            currentBlock += field.arguments[val];
          }

          if (val.startsWith('<field') && val !== '<field:1>') {
            var re = new RegExp(val, 'g');
            emessage = emessage.replace(re, '" + input.' + field.arguments[val] + ' + "');
          }
        });

        if (i === flattenRulesArrays.length - 1 || flattenRulesArrays[i + 1].operation) {
          currentBlock += ')) {\n' + conditions + '} else {\n' + 'isValid = false;\n' + 'errMsg = "' + emessage + '";\n' + 'errCode = ' + validation.ecode + ';\n' + '}\n';
        } else {
          // if operation === 'OR'
          currentBlock += ')) {\n} else {\n' + conditions + '\n}\n';
        }

        conditions = currentBlock;
      }

      conditions += '\n';
      var initFn = 'function isValid(input, context) {\n' + 'var isValid = true;\n' + 'var errMsg = "";\n' + 'var errCode = 0;\n'; // LOAD CONTEXT

      var context = '';
      angular.forEach(classNameList, function (className) {
        context = context + 'var ' + className + ' = context.getValidator("' + className + '");\n';
      });
      var loggerLoad = 'var logger = context.getLogger();\n\n';
      var loggerEnd = 'if (!isValid) {\n' + 'var message = "(" + errCode + ") " + errMsg;\n' + 'logger.warn("Validation failed with error {}", message);\n' + '}\n\n';
      var fn = initFn + context + loggerLoad + conditions + loggerEnd + 'return {\n' + '"isValid": isValid,\n' + '"errorCode": errCode,\n' + '"errorMsg": errMsg\n' + '};\n}\n';
      var validatorProperties = {
        validators: validatorsList,
        validationScript: js_beautify(fn, {
          indent_size: 2
        })
      };

      if ($scope.model.properties !== validatorProperties) {
        $scope.model.properties = validatorProperties;
      }

      if ($scope.model.validationFields !== vm.validationFields) {
        $scope.model.validationFields = vm.validationFields;
      }
    }

    function validateNodesLabels() {
      var nodes = HydratorPlusPlusConfigStore.getNodes();
      var nodeName = $scope.model.label;

      if (!nodeName) {
        return;
      }

      NonStorePipelineErrorFactory.isNodeNameUnique(nodeName, nodes, function (err) {
        if (err) {
          vm.nodeLabelError = GLOBALS.en.hydrator.studio.error[err];
        } else {
          vm.nodeLabelError = '';
        }
      });
    }

    $scope.$watch('model.label', validateNodesLabels); // Since validation fields is a reference and we overwrite the array
    // reference all the time $watch will not be triggered hence the event communication.

    EventPipe.on('resetValidatorValidationFields', function (validationFields) {
      vm.validationFields = validationFields || {};
      $scope.model.validationFields = vm.validationFields;
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /validators/validator-factory.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  ValidatorFactory.$inject = ["esprima"];
  function ValidatorFactory(esprima) {
    'ngInject';

    var AND = true,
        OR = false;

    function initValidationFields(properties, functionMap) {
      if (!properties.validationScript) {
        return {};
      }

      var jsonTree = esprima.parse(properties.validationScript);
      /**
       *  Algorithm:
       *    1. Find the first if-else block statement
       *    2. Call Add Rule on the if-else tree
       *    3. For each if-else tree:
       *        a. Find the field name from the arguments
       *        b. Create validation key '<validator object>.<validation function name>'
       *        c. Add the rest of the arguments for the validation function (if any)
       *        d. Push object to the fieldGroup
       *        e. Check if the if block body contains another if-else block.
       *            - If yes, call _addRule with operation true (means to treat the
       *                next rule as AND operation)
       *            - If no, check if alternate body contains another if-else block. If yes,
       *                call _addRule with opertaion false (treat next rule as OR operation)
       **/

      var block = jsonTree.body[0].body.body;
      var initialValidation;

      for (var i = 0; i < block.length; i++) {
        if (block[i].type === 'IfStatement') {
          initialValidation = block[i];
          break;
        }
      }

      var fieldGroup = {};

      _addRule(fieldGroup, initialValidation, functionMap, AND);

      return fieldGroup;
    }

    function _findFieldArgument(args) {
      for (var j = 0; j < args.length; j++) {
        if (args[j].type === 'MemberExpression') {
          return args[j];
        }
      }
    }

    function _addRule(fieldGroup, rule, functionMap, operation) {
      // Find validation rule argument
      var field = _findFieldArgument(rule.test.arguments);

      var fieldName = field.property.name; // ie. coreValidator.maxLength

      var validationKey = rule.test.callee.object.name + '.' + rule.test.callee.property.name;

      if (!fieldGroup[fieldName]) {
        fieldGroup[fieldName] = [];
      }

      var obj = {
        fieldName: fieldName,
        operation: operation,
        validation: validationKey
      }; // Adding the rest of validation function arguments (if any)

      var argsValidationRule = functionMap[validationKey].arguments;

      if (argsValidationRule.length > 1) {
        obj.arguments = {};
        angular.forEach(argsValidationRule, function (val, index) {
          if (!val.startsWith('<field:')) {
            var argValue = rule.test.arguments[index];
            obj.arguments[val] = argValue.value;
          }
        });
      }

      fieldGroup[fieldName].push(obj); // Recursive call

      if (rule.consequent.body.length && rule.consequent.body[0].type === 'IfStatement') {
        // Treat next rule as AND
        _addRule(fieldGroup, rule.consequent.body[0], functionMap, AND);
      } else if (rule.alternate.body.length && rule.alternate.body[0].type === 'IfStatement') {
        // Treat next rule as OR
        _addRule(fieldGroup, rule.alternate.body[0], functionMap, OR);
      }
    }

    return {
      initValidationFields: initValidationFields
    };
  }

  angular.module(PKG.name + '.commons').factory('ValidatorFactory', ValidatorFactory);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /validators/validators.js */

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
  angular.module(PKG.name + '.commons').directive('myValidators', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        errorDatasetName: '=',
        inputSchema: '=',
        isDisabled: '=',
        outputSchema: '='
      },
      templateUrl: 'validators/validators.html',
      controller: 'MyValidatorsCtrl',
      controllerAs: 'ValidatorsCtrl'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /bytes.js */

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
  // adapted from https://gist.github.com/thomseddon/3511330
  angular.module(PKG.name + '.filters').filter('bytes', function () {
    return function (bytes, precision) {
      if (bytes < 1 || isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '0b';
      }

      if (typeof precision === 'undefined') {
        precision = bytes > 1023 ? 1 : 0;
      }

      var number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + '' + ['b', 'kB', 'MB', 'GB', 'TB', 'PB'][number];
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /comma-separated-number.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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

  /**
   * Adds comma separator to numeric strings with ellipsis. e.g. '...11111' -> '...11,111'.
   * If the string doesn't contain ellipses, then just returns the comma separated number as string.
   **/
  angular.module(PKG.name + '.filters').filter('commaSeparatedNumber', function () {
    return function (input) {
      return parseInt(input, 10).toLocaleString('en');
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /ellipsis.js */

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

  /**
   * Intended for truncating long namespace display name
   **/
  angular.module(PKG.name + '.filters').filter('myEllipsis', function () {
    return function (input, limit) {
      if (typeof input === 'string') {
        return input.length > limit ? input.substr(0, limit - 1) + "\u2026 " : input;
      } else {
        return input;
      }
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /multi-key-search.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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

  /**
   * Filter that searches through multiple keys of an object for the search text.
   * This does a case insensitive "contains" match for the search term.
   * @param {Array} input Items to search through.
   * @param {Array} keys Keys to match.
   * @param {String} search Search terms.
   * @return {Array} filtered items.
   */
  angular.module(PKG.name + '.filters').filter('myMultiKeySearch', function () {
    return function multiKeySearch(input, keys, search) {
      if (!angular.isArray(keys) || !keys.length || !search) {
        return input;
      }

      search = search.toLowerCase();
      return input.filter(function (value) {
        return keys.filter(function (key) {
          return value[key] && value[key].toLowerCase().indexOf(search) !== -1;
        }).length;
      });
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /number.js */

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
  angular.module(PKG.name + '.filters').filter('myNumber', function () {
    return function (input, precision) {
      if (input < 1 || isNaN(parseFloat(input)) || !isFinite(input)) {
        return '0';
      }

      if (typeof precision === 'undefined') {
        precision = input > 1023 ? 1 : 0;
      }

      var number = Math.floor(Math.log(input) / Math.log(1000));
      return (input / Math.pow(1000, Math.floor(number))).toFixed(precision) + '' + ['', 'k', 'M', 'G', 'T', 'P'][number];
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /paginate.js */

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
  angular.module(PKG.name + '.filters').filter('myPaginate', function () {
    return function (input, page, limit) {
      var pageLimit = limit || 10,
          // default value is 10 per page
      start = (page - 1) * pageLimit,
          end = start + pageLimit;

      if (input.length < start) {
        start = 0;
        end = pageLimit;
      }

      return input.slice(start, end);
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /remove-camel-case.js */

  /*
   * Copyright © 2017 Cask Data, Inc.
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
  angular.module(PKG.name + '.filters').filter('myRemoveCamelcase', function () {
    return function camelToTitle(input) {
      // Handle "HBase" or "OCaml" case with no change to input.
      var result = input.match(/^[A-Z][A-Z][a-z]+/); // FIXME: specifically for 'JavaScript' case which we don't want to split.

      var jsresult = input.match(/^JavaScript?/);

      if (result || jsresult) {
        return input;
      } // FIXME: Hardcoded for now since we don't want to modify algorithm for these 2 cases.
      // Also we don't know where exactly to split either
      // Ideally this should come from the backend


      if (input === 'CDCHBase') {
        return 'CDC HBase';
      }

      if (input === 'ChangeTrackingSQLServer') {
        return 'Change Tracking SQLServer';
      }

      return input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([a-z])/g, ' $1$2').replace(/\ +/g, ' ').trim();
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /title.js */

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

  /**
   * myTitleFilter
   * intended for use in the <title> tag.
   */
  angular.module(PKG.name + '.filters').filter('myTitleFilter', function myTitleFilter() {
    return function (state) {
      if (!state) {
        return '';
      }

      var title = state.data && state.data.title;
      return (title ? title + ' | ' : '') + 'CDAP';
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /cask-angular-capitalize/capitalize.js */

  /*
   * Copyright © 2015-2018 Cask Data, Inc.
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

  /**
   * myCapitalizeFilter
   * note that bootstrap gives us .text-capitalize, use it instead of this filter
   *  unless you really only want to capitalize the first character of a sentence.
   */
  angular.module(PKG.name + '.filters').filter('caskCapitalizeFilter', function caskCapitalizeFilter() {
    return function (input) {
      input = input ? input.toLowerCase() : '';
      return input.substr(0, 1).toUpperCase() + input.substr(1);
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /global-lib.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  angular.module("".concat(PKG.name, ".commons")).factory('d3', ["$window", function ($window) {
    return $window.d3;
  }]).factory('c3', ["$window", function ($window) {
    return $window.c3;
  }]).factory('Redux', ["$window", function ($window) {
    return $window.Redux;
  }]).factory('ReduxThunk', ["$window", function ($window) {
    return $window.ReduxThunk;
  }]).factory('js_beautify', ["$window", function ($window) {
    return $window.js_beautify;
  }]).factory('esprima', ["$window", function ($window) {
    return $window.esprima;
  }]).factory('avsc', function () {
    return window.CaskCommon.cdapavscwrapper;
  }).factory('moment', ["$window", function ($window) {
    return $window.moment;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /module.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  angular.module(PKG.name + '.feature.tracker', [PKG.name + '.commons']);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /home-ctrl.js */

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
  angular.module(PKG.name + '.feature.tracker').controller('TrackerHomeController', ["$state", "$stateParams", "rNsList", "mySessionStorage", "myLoadingService", function ($state, $stateParams, rNsList, mySessionStorage, myLoadingService) {
    if (!rNsList.length) {
      $state.go('unauthorized');
      return;
    } // Needed to inject StatusFactory here for angular to instantiate the service and start polling.
    // check that $state.params.namespace is valid
    // Access local storage for currently set namespace; if none is currently set resort to default ns


    var ns = $state.params.namespace;
    var defaultNS = localStorage.getItem('DefaultNamespace');
    var setNamespace = ns ? ns : defaultNS;
    var n = rNsList.filter(function (one) {
      return one.name === setNamespace;
    });

    function checkNamespace(ns) {
      return rNsList.filter(function (namespace) {
        return namespace.name === ns;
      }).length;
    }

    var PREFKEY = 'feature.home.ns.latest';

    if (!n.length) {
      mySessionStorage.get(PREFKEY).then(function (latest) {
        if (latest && checkNamespace(latest)) {
          $state.go('tracker.home', {
            namespace: latest
          }, {
            reload: true
          });
          return;
        } // check for default


        if (checkNamespace('default')) {
          $state.go('tracker.home', {
            namespace: 'default'
          }, {
            reload: true
          });
          return;
        } else {
          $state.go('tracker.home', {
            namespace: rNsList[0].name
          }, {
            reload: true
          });
          return;
        }
      });
    } else {
      mySessionStorage.set(PREFKEY, $state.params.namespace);
      $state.go('tracker.home', {
        namespace: setNamespace
      }, {
        reload: true
      });
    }

    myLoadingService.hideLoadingIcon();
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /routes.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  angular.module(PKG.name + '.feature.tracker').config(["$stateProvider", "$urlRouterProvider", "MYAUTH_ROLE", function ($stateProvider, $urlRouterProvider, MYAUTH_ROLE) {
    var reactAppUrl = {
      home: "/cdap/ns/<namespace>/metadata",
      search: "/cdap/ns/<namespace>/metadata/search/<query>/result",
      summary: "/cdap/ns/<namespace>/metadata/<entityType>/<entityId>/summary/search/<query>",
      lineage: "/cdap/ns/<namespace>/metadata/<entityType>/<entityId>/lineage/search/<query>"
    };
    var productName = window.CaskCommon.ThemeHelper.Theme.productName;
    $urlRouterProvider.otherwise(function () {
      //unmatched route, will show 404
      window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, {
        statusCode: 404
      });
    });
    $stateProvider.state('home', {
      url: '/',
      template: '<ui-view/>',
      resolve: {
        sessionToken: function sessionToken() {
          window.CaskCommon.SessionTokenStore.fetchSessionToken();
        },
        rNsList: ["myNamespace", function rNsList(myNamespace) {
          return myNamespace.getList();
        }]
      },
      controller: 'TrackerHomeController'
    }).state('ns', {
      url: '/ns/:namespace',
      "abstract": true,
      template: '<ui-view/>',
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'development'
      },
      resolve: {
        sessionToken: function sessionToken() {
          window.CaskCommon.SessionTokenStore.fetchSessionToken();
        },
        rResetPreviousPageLevelError: function rResetPreviousPageLevelError() {
          window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, {
            reset: true
          });
        },
        rValidNamespace: ["$stateParams", function rValidNamespace($stateParams) {
          return window.CaskCommon.validateNamespace($stateParams.namespace);
        }]
      }
    }).state('tracker', {
      url: '?iframe&sourceUrl',
      "abstract": true,
      parent: 'ns',
      template: '<ui-view/>',
      resolve: {
        sessionToken: function sessionToken() {
          window.CaskCommon.SessionTokenStore.fetchSessionToken();
        }
      }
    }).state('tracker.home', {
      url: '',
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      },
      templateUrl: '/assets/features/tracker/templates/main.html',
      controller: 'TrackerMainController',
      onEnter: ["$stateParams", function onEnter($stateParams) {
        // Redirect to react page when the feature is turned on
        if (window.CaskCommon.ThemeHelper.Theme.isMetadataInReact) {
          window.location.href = reactAppUrl.home.replace('<namespace>', $stateParams.namespace);
        } else {
          document.title = "".concat(productName, " | Search");
        }
      }],
      controllerAs: 'MainController'
    }).state('tracker.detail', {
      url: '',
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      },
      templateUrl: '/assets/features/tracker/templates/container.html',
      controller: 'TrackerContainerController',
      controllerAs: 'ContainerController'
    }).state('tracker.detail.result', {
      url: '/search/:searchQuery/result',
      templateUrl: '/assets/features/tracker/templates/results.html',
      controller: 'TrackerResultsController',
      controllerAs: 'ResultsController',
      onEnter: ["$stateParams", function onEnter($stateParams) {
        // Redirect to react page when the feature is turned on
        if (window.CaskCommon.ThemeHelper.Theme.isMetadataInReact) {
          var searchUrl = reactAppUrl.search.replace('<namespace>', $stateParams.namespace);
          window.location.href = searchUrl.replace('<query>', $stateParams.searchQuery);
        } else {
          document.title = "".concat(productName, " | Search | Results");
        }
      }],
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      }
    }).state('tracker.detail.entity', {
      url: '/entity/:entityType/:entityId?searchTerm',
      templateUrl: '/assets/features/tracker/templates/entity.html',
      controller: 'TrackerEntityController',
      controllerAs: 'EntityController',
      onEnter: ["$stateParams", function onEnter($stateParams) {
        document.title = "".concat(productName, " | Search | ").concat($stateParams.entityId);
      }],
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      }
    }).state('tracker.detail.entity.metadata', {
      url: '/summary',
      templateUrl: '/assets/features/tracker/templates/metadata.html',
      controller: 'TrackerMetadataController',
      controllerAs: 'MetadataController',
      onEnter: ["$stateParams", function onEnter($stateParams) {
        // Redirect to react page when the feature is turned on
        if (window.CaskCommon.ThemeHelper.Theme.isMetadataInReact) {
          var searchUrl = reactAppUrl.summary.replace('<namespace>', $stateParams.namespace);
          searchUrl = searchUrl.replace('<entityType>', $stateParams.entityType);
          searchUrl = searchUrl.replace('<entityId>', $stateParams.entityId);
          window.location.href = searchUrl.replace('<query>', $stateParams.searchTerm);
        } else {
          document.title = "".concat(productName, " | Search | ").concat($stateParams.entityId, " | Summary");
        }
      }],
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      }
    }).state('tracker.detail.entity.lineage', {
      url: '/lineage?start&end&method',
      templateUrl: '/assets/features/tracker/templates/lineage.html',
      controller: 'TrackerLineageController',
      onEnter: ["$stateParams", function onEnter($stateParams) {
        document.title = "".concat(productName, " | Search | ").concat($stateParams.entityId, " | Lineage");
      }],
      controllerAs: 'LineageController',
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'search'
      }
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/container-ctrl.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  var TrackerContainerController = /*#__PURE__*/function () {
    TrackerContainerController.$inject = ["$state"];
    function TrackerContainerController($state) {
      _classCallCheck(this, TrackerContainerController);

      this.$state = $state;
      this.searchQuery = this.$state.params.searchQuery || this.$state.params.searchTerm;
    }

    _createClass(TrackerContainerController, [{
      key: "search",
      value: function search(event) {
        if (event.keyCode === 13 && this.searchQuery) {
          this.$state.go('tracker.detail.result', {
            searchQuery: this.searchQuery
          }, {
            reload: true
          });
        }
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerContainerController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerContainerController', TrackerContainerController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/entity-ctrl.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
   * use this file except in compliance with the License. You may obtain a copy of
   * the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
   * License for the specific language governing permissions and limitations under
   * the License.
   */
  var TrackerEntityController = /*#__PURE__*/function () {
    TrackerEntityController.$inject = ["$state"];
    function TrackerEntityController($state) {
      'ngInject';

      _classCallCheck(this, TrackerEntityController);

      this.$state = $state;
      this.entityInfo = {
        name: 'Dataset',
        icon: 'icon-datasets'
      };
      this.showLineage = window.CaskCommon.ThemeHelper.Theme.showLineage;
    }

    _createClass(TrackerEntityController, [{
      key: "goBack",
      value: function goBack() {
        this.$state.go('tracker.detail.result', {
          namespace: this.$state.params.namespace,
          searchQuery: this.$state.params.searchTerm
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerEntityController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerEntityController', TrackerEntityController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/lineage-ctrl.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  var TrackerLineageController = /*#__PURE__*/function () {
    TrackerLineageController.$inject = ["$state", "myTrackerApi", "$scope", "LineageActions", "LineageStore"];
    function TrackerLineageController($state, myTrackerApi, $scope, LineageActions, LineageStore) {
      _classCallCheck(this, TrackerLineageController);

      this.$state = $state;
      this.myTrackerApi = myTrackerApi;
      this.$scope = $scope;
      this.LineageActions = LineageActions;
      LineageStore.setDefaults(); // id comes from TIME_OPTIONS in FieldLevelLineage store

      this.timeRangeOptions = [{
        label: 'Last 7 days',
        id: 'last7d',
        start: 'now-7d',
        end: 'now'
      }, {
        label: 'Last 14 days',
        id: 'last14d',
        start: 'now-14d',
        end: 'now'
      }, {
        label: 'Last month',
        id: 'lastMonth',
        start: 'now-30d',
        end: 'now'
      }, {
        label: 'Last 6 months',
        id: 'last6M',
        start: 'now-180d',
        end: 'now'
      }, {
        label: 'Last 12 months',
        id: 'lastYear',
        start: 'now-365d',
        end: 'now'
      }];
      this.lineageInfo = {};
      this.loading = false;
      this.customTimeRange = {
        startTime: null,
        endTime: null
      };
      this.timeRange = {
        start: $state.params.start || 'now-7d',
        end: $state.params.end || 'now'
      };
      this.selectedTimeRange = this.findTimeRange();
      this.getLineage(this.$state.params.entityType, this.$state.params.entityId);
      this.fieldLevelLineageLinkBase = window.getAbsUIUrl({
        namespaceId: this.$state.params.namespace,
        entityType: 'datasets',
        entityId: this.$state.params.entityId
      }).concat('/fields');
      this.fieldLevelLineageLink = window.buildCustomUrl(this.fieldLevelLineageLinkBase, this.getTimeRangeParams());
    }

    _createClass(TrackerLineageController, [{
      key: "findTimeRange",
      value: function findTimeRange() {
        var _this = this;

        var match = this.timeRangeOptions.filter(function (option) {
          return option.start === _this.timeRange.start && option.end === _this.timeRange.end;
        });

        if (match.length === 0) {
          this.isCustom = true;
          this.customTimeRange.startTime = new Date(parseInt(this.$state.params.start, 10) * 1000);
          this.customTimeRange.endTime = new Date(parseInt(this.$state.params.end, 10) * 1000);
        }

        return match.length > 0 ? match[0] : {
          label: 'Custom',
          id: 'CUSTOM'
        };
      }
    }, {
      key: "goToCustomTimeRangeEntityDetailView",
      value: function goToCustomTimeRangeEntityDetailView() {
        var startTime = parseInt(this.customTimeRange.startTime.valueOf() / 1000, 10);
        var endTime = parseInt(this.customTimeRange.endTime.valueOf() / 1000, 10);
        this.$state.go('tracker.detail.entity.lineage', {
          start: startTime,
          end: endTime
        });
      }
    }, {
      key: "selectCustom",
      value: function selectCustom() {
        this.isCustom = true;
        this.selectedTimeRange.label = 'Custom';
        this.selectedTimeRange.id = 'CUSTOM';
      }
    }, {
      key: "getTimeRangeParams",
      value: function getTimeRangeParams() {
        var params = {};
        params.time = this.selectedTimeRange.id;

        if (this.selectedTimeRange.id === 'CUSTOM') {
          params.start = this.$state.params.start;
          params.end = this.$state.params.end;
        }

        return params;
      }
    }, {
      key: "getLineage",
      value: function getLineage(entityType, entityId) {
        var _this2 = this;

        this.loading = true;
        var params = {
          namespace: this.$state.params.namespace,
          entityType: entityType,
          entityId: entityId,
          scope: this.$scope,
          start: this.timeRange.start,
          end: this.timeRange.end,
          levels: 1,
          rollup: 'workflow'
        };
        this.myTrackerApi.getLineage(params).$promise.then(function (res) {
          _this2.LineageActions.loadLineageData(res, params, _this2.$state.params.method);

          _this2.loading = false;
        }, function (err) {
          console.log('Error', err);
          _this2.loading = false;
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerLineageController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerLineageController', TrackerLineageController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/main-ctrl.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  var TrackerMainController = /*#__PURE__*/function () {
    TrackerMainController.$inject = ["$state", "$scope", "myTrackerApi", "caskFocusManager"];
    function TrackerMainController($state, $scope, myTrackerApi, caskFocusManager) {
      _classCallCheck(this, TrackerMainController);

      this.$state = $state;
      this.$scope = $scope;
      this.searchQuery = '';
      this.myTrackerApi = myTrackerApi;
      caskFocusManager.focus('searchField');
    }

    _createClass(TrackerMainController, [{
      key: "search",
      value: function search(event) {
        if (event.keyCode === 13 && this.searchQuery) {
          this.$state.go('tracker.detail.result', {
            searchQuery: this.searchQuery
          });
        }
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerMainController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerMainController', TrackerMainController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/metadata-ctrl.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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

  /**
   * This class is responsible for controlling the Metadata View in Tracker
   * entity detai page.
   **/

  /*
    TODO:
      - What to do with externalDataset type
  */
  var TrackerMetadataController = /*#__PURE__*/function () {
    TrackerMetadataController.$inject = ["$state", "myTrackerApi", "$scope", "myAlertOnValium", "$timeout", "$q", "caskFocusManager"];
    function TrackerMetadataController($state, myTrackerApi, $scope, myAlertOnValium, $timeout, $q, caskFocusManager) {
      var _this = this;

      _classCallCheck(this, TrackerMetadataController);

      this.$state = $state;
      this.myTrackerApi = myTrackerApi;
      this.$scope = $scope;
      this.myAlertOnValium = myAlertOnValium;
      this.$timeout = $timeout;
      this.$q = $q;
      this.caskFocusManager = caskFocusManager;
      this.duplicateTag = false;
      this.propertyInput = {
        key: '',
        value: ''
      };
      var entityType = this.$state.params.entityType;
      var entityId = this.$state.params.entityId;
      var params = {
        scope: this.$scope,
        namespace: this.$state.params.namespace,
        entityType: entityType,
        entityId: entityId
      };
      var metadataApi = this.myTrackerApi.properties(params).$promise;
      this.systemTags = {};
      this.userTags = [];
      this.getUserTags();
      this.schema = [];
      this.properties = {};
      this.activePropertyTab = 0;
      this.tagInputModel = '';
      this.loading = true;
      metadataApi.then(function (res) {
        _this.loading = false;

        _this.processResponse(res);
      }, function (err) {
        _this.loading = false;
        console.log('Error', err);
      });
    }

    _createClass(TrackerMetadataController, [{
      key: "processResponse",
      value: function processResponse(res) {
        var systemProperties = {},
            userProperties = {};
        res.properties.forEach(function (property) {
          if (property.scope === 'SYSTEM') {
            systemProperties[property.name] = property.value;
          } else {
            userProperties[property.name] = property.value;
          }
        });
        this.systemTags = {
          system: res.tags.filter(function (tag) {
            return tag.scope === 'SYSTEM';
          }).map(function (tag) {
            return tag.name;
          })
        };
        this.properties = {
          system: systemProperties,
          user: userProperties,
          isUserEmpty: false,
          isSystemEmpty: false
        };
        /**
         * Need to show Dataset Spec from Dataset Properties if
         * dataset type is externalDataset. Ideally Backend should
         * return this automatically.
         **/

        if (systemProperties.type === 'externalDataset') {
          this.fetchExternalDatasetProperties();
        }

        if (Object.keys(userProperties).length === 0) {
          this.activePropertyTab = 1;
          this.properties.isUserEmpty = true;
        }

        this.properties.isSystemEmpty = Object.keys(systemProperties).length === 0;
        this.schema = systemProperties.schema;
      }
    }, {
      key: "fetchExternalDatasetProperties",
      value: function fetchExternalDatasetProperties() {
        var _this2 = this;

        var datasetParams = {
          namespace: this.$state.params.namespace,
          entityId: this.$state.params.entityId,
          scope: this.$scope
        };
        this.myTrackerApi.getDatasetDetail(datasetParams).$promise.then(function (res) {
          _this2.externalDatasetProperties = res.spec.properties;

          if (Object.keys(_this2.externalDatasetProperties).length > 0) {
            _this2.activePropertyTab = 0;
            _this2.properties.isUserEmpty = false;
          }
        });
      }
      /* METADATA PROPERTIES CONTROL */

    }, {
      key: "deleteProperty",
      value: function deleteProperty(key) {
        var _this3 = this;

        var deleteParams = {
          namespace: this.$state.params.namespace,
          entityType: this.$state.params.entityType,
          entityId: this.$state.params.entityId,
          key: key,
          scope: this.$scope
        };
        this.myTrackerApi.deleteEntityProperty(deleteParams).$promise.then(function () {
          delete _this3.properties.user[key];
        }, function (err) {
          _this3.myAlertOnValium.show({
            type: 'danger',
            content: err.data
          });
        });
      }
    }, {
      key: "addProperty",
      value: function addProperty() {
        var _this4 = this;

        if (!this.propertyInput.key || !this.propertyInput.value) {
          return;
        }

        var addParams = {
          namespace: this.$state.params.namespace,
          entityType: this.$state.params.entityType,
          entityId: this.$state.params.entityId,
          scope: this.$scope
        };
        var obj = {};
        obj[this.propertyInput.key] = this.propertyInput.value;
        this.myTrackerApi.addEntityProperty(addParams, obj).$promise.then(function () {
          _this4.properties.user[_this4.propertyInput.key] = _this4.propertyInput.value;
          _this4.propertyInput.key = '';
          _this4.propertyInput.value = '';

          _this4.propertyFocus();
        }, function (err) {
          _this4.myAlertOnValium.show({
            type: 'danger',
            content: err.data
          });
        });
      }
    }, {
      key: "propertyKeypress",
      value: function propertyKeypress(event) {
        switch (event.keyCode) {
          case 13:
            // Enter Key
            this.addProperty();
            break;
        }
      }
    }, {
      key: "propertyFocus",
      value: function propertyFocus() {
        this.$timeout(function () {
          var elem = document.getElementById('property-key-input');
          angular.element(elem)[0].focus();
        });
      }
      /* TAGS CONTROL */

    }, {
      key: "getUserTags",
      value: function getUserTags() {
        var _this5 = this;

        var params = {
          namespace: this.$state.params.namespace,
          entityId: this.$state.params.entityId,
          entityType: 'dataset',
          scope: this.$scope
        };
        this.myTrackerApi.getUserTags(params).$promise.then(function (res) {
          _this5.userTags = res.tags.map(function (tag) {
            return tag.name;
          });
        });
      }
    }, {
      key: "deleteTag",
      value: function deleteTag(tag) {
        var _this6 = this;

        var params = {
          namespace: this.$state.params.namespace,
          entityId: this.$state.params.entityId,
          entityType: 'dataset',
          tag: tag,
          scope: this.$scope
        };
        this.myTrackerApi.deleteTag(params).$promise.then(function () {
          _this6.getUserTags();
        });
      }
    }, {
      key: "addTag",
      value: function addTag() {
        var _this7 = this;

        var input = this.tagInputModel;

        if (!input) {
          return;
        }

        this.invalidFormat = false;
        this.duplicateTag = this.userTags.filter(function (tag) {
          return input === tag.name;
        }).length > 0 ? true : false;

        if (!this.duplicateTag) {
          var params = {
            namespace: this.$state.params.namespace,
            entityId: this.$state.params.entityId,
            entityType: 'dataset',
            scope: this.$scope
          };
          this.myTrackerApi.addTag(params, [input]).$promise.then(function () {
            _this7.getUserTags();

            _this7.tagInputModel = '';
          }, function (err) {
            if (err.statusCode === 400) {
              _this7.invalidFormat = true;
            }
          });
        }
      }
    }, {
      key: "goToTag",
      value: function goToTag(event, tag) {
        event.stopPropagation();
        this.$state.go('tracker.detail.result', {
          searchQuery: tag
        });
      }
    }, {
      key: "openTagInput",
      value: function openTagInput(event) {
        var _this8 = this;

        event.stopPropagation();
        this.inputOpen = true;
        this.caskFocusManager.focus('tagInput');

        this.eventFunction = function () {
          _this8.escapeInput();
        };

        document.body.addEventListener('click', this.eventFunction, false);
      }
    }, {
      key: "escapeInput",
      value: function escapeInput() {
        this.invalidFormat = false;
        this.duplicateTag = false;
        this.inputOpen = false;
        document.body.removeEventListener('click', this.eventFunction, false);
        this.eventFunction = null;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerMetadataController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerMetadataController', TrackerMetadataController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/results-ctrl.js */

  /*
   * Copyright © 2016-2018 Cask Data, Inc.
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
  var METADATA_FILTERS = {
    name: 'Name',
    description: 'Description',
    userTags: 'User tags',
    systemTags: 'System tags',
    userProperties: 'User properties',
    systemProperties: 'System properties',
    schema: 'Schema'
  };

  var TrackerResultsController = /*#__PURE__*/function () {
    TrackerResultsController.$inject = ["$state", "myTrackerApi", "$scope", "myHelpers"];
    function TrackerResultsController($state, myTrackerApi, $scope, myHelpers) {
      _classCallCheck(this, TrackerResultsController);

      this.$state = $state;
      this.$scope = $scope;
      this.myTrackerApi = myTrackerApi;
      this.myHelpers = myHelpers;
      this.loading = false;
      this.entitiesShowAllButton = false;
      this.metadataShowAllButton = false;
      this.currentPage = 1;
      this.fullResults = [];
      this.searchResults = [];
      this.sortByOptions = [{
        name: 'Oldest first',
        sort: 'createDate'
      }, {
        name: 'Newest first',
        sort: '-createDate'
      }, {
        name: 'A → Z',
        sort: 'name'
      }, {
        name: 'Z → A',
        sort: '-name'
      }];
      this.sortBy = this.sortByOptions[0];
      this.entityFiltersList = [{
        name: 'Datasets',
        isActive: true,
        isHover: false,
        filter: 'Dataset',
        count: 0
      }];
      this.metadataFiltersList = [{
        name: METADATA_FILTERS.name,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.description,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.userTags,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.systemTags,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.userProperties,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.systemProperties,
        isActive: true,
        isHover: false,
        count: 0
      }, {
        name: METADATA_FILTERS.schema,
        isActive: true,
        isHover: false,
        count: 0
      }];
      this.numMetadataFiltersMatched = 0;
      this.fetchResults();
    }

    _createClass(TrackerResultsController, [{
      key: "fetchResults",
      value: function fetchResults() {
        var _this = this;

        this.loading = true;
        var params = {
          namespace: this.$state.params.namespace,
          query: this.$state.params.searchQuery,
          scope: this.$scope,
          responseFormat: 'v6'
        };

        if (params.query === '*') {
          params.sort = 'creation-time desc';
        } else if (params.query.charAt(params.query.length - 1) !== '*') {
          params.query = params.query + '*';
        }

        this.myTrackerApi.search(params).$promise.then(function (res) {
          _this.fullResults = res.results.map(_this.parseResult.bind(_this));
          _this.numMetadataFiltersMatched = _this.getMatchedFiltersCount();
          _this.searchResults = angular.copy(_this.fullResults);
          _this.loading = false;
        }, function (err) {
          console.log('error', err);
          _this.loading = false;
        });
      }
    }, {
      key: "parseResult",
      value: function parseResult(entityObj) {
        var obj = {};
        angular.extend(obj, {
          name: entityObj.entity.details.dataset,
          type: 'Dataset',
          entityTypeState: 'datasets',
          icon: 'icon-datasets'
        });
        var description = 'No description provided for this Dataset.',
            createDate = null,
            datasetType = null;
        angular.forEach(entityObj.metadata.properties, function (property) {
          switch (property.name) {
            case 'description':
              description = property.value;
              break;

            case 'creation-time':
              createDate = property.value;
              break;

            case 'type':
              datasetType = property.value;
              break;
          }
        });
        angular.extend(obj, {
          description: description,
          createDate: createDate,
          datasetType: datasetType
        });

        if (entityObj.metadata.tags.find(function (tag) {
          return tag.name === 'explore' && tag.scope === 'SYSTEM';
        })) {
          obj.datasetExplorable = true;
        }

        obj.queryFound = this.findQueries(entityObj, obj);
        this.entityFiltersList[0].count++;
        return obj;
      }
    }, {
      key: "findQueries",
      value: function findQueries(entityObj, parsedEntity) {
        // Removing special characters from search query
        var replaceRegex = new RegExp('[^a-zA-Z0-9_-]', 'g');
        var searchTerm = this.$state.params.searchQuery.replace(replaceRegex, '');
        var regex = new RegExp(searchTerm, 'ig');
        var foundIn = []; // Name

        if (parsedEntity.name.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.name);
          this.metadataFiltersList[0].count++;
        } // Description


        var description = entityObj.metadata.properties.find(function (property) {
          return property.name === 'decription' && property.scope === 'SYSTEM';
        });

        if (description && description.value.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.description);
          this.metadataFiltersList[1].count++;
        } // Tags


        var userTags = entityObj.metadata.tags.filter(function (tag) {
          return tag.scope === 'USER';
        }).map(function (tag) {
          return tag.name;
        });
        userTags = userTags.toString();
        var systemTags = entityObj.metadata.tags.filter(function (tag) {
          return tag.scope === 'SYSTEM';
        }).map(function (tag) {
          return tag.name;
        });
        systemTags = systemTags.toString();

        if (userTags.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.userTags);
          this.metadataFiltersList[2].count++;
        }

        if (systemTags.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.systemTags);
          this.metadataFiltersList[3].count++;
        } // Properties


        function convertToObject(arr) {
          var returnObj = {};
          arr.forEach(function (pair) {
            returnObj[pair.name] = pair.value;
          });
          return returnObj;
        }

        var userProperties = entityObj.metadata.properties.filter(function (property) {
          return property.scope === 'USER';
        });
        userProperties = JSON.stringify(convertToObject(userProperties));
        var systemProperties = entityObj.metadata.properties.filter(function (property) {
          return property.scope === 'SYSTEM' && property.name !== 'schema';
        });
        systemProperties = JSON.stringify(convertToObject(systemProperties));

        if (userProperties.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.userProperties);
          this.metadataFiltersList[4].count++;
        }

        if (systemProperties.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.systemProperties);
          this.metadataFiltersList[5].count++;
        } // Schema


        var schema = entityObj.metadata.properties.find(function (property) {
          return property.name === 'schema' && property.scope === 'SYSTEM';
        });

        if (schema && schema.value.search(regex) > -1) {
          foundIn.push(METADATA_FILTERS.schema);
          this.metadataFiltersList[6].count++;
        }

        return foundIn;
      }
    }, {
      key: "onlyFilter",
      value: function onlyFilter(event, filter, filterType) {
        event.preventDefault();
        var filterObj = [];

        if (filterType === 'ENTITIES') {
          filterObj = this.entityFiltersList;
        } else if (filterType === 'METADATA') {
          filterObj = this.metadataFiltersList;
        }

        angular.forEach(filterObj, function (entity) {
          entity.isActive = entity.name === filter.name ? true : false;
        });
        this.filterResults();
      }
    }, {
      key: "filterResults",
      value: function filterResults() {
        var filter = [];
        angular.forEach(this.entityFiltersList, function (entity) {
          if (entity.isActive) {
            filter.push(entity.filter);
          }
        });
        var entitySearchResults = this.fullResults.filter(function (result) {
          return filter.indexOf(result.type) > -1 ? true : false;
        });
        var metadataFilter = [];
        angular.forEach(this.metadataFiltersList, function (metadata) {
          if (metadata.isActive) {
            metadataFilter.push(metadata.name);
          }
        });
        this.searchResults = entitySearchResults.filter(function (result) {
          if (result.queryFound.length === 0) {
            return true;
          }

          return _.intersection(metadataFilter, result.queryFound).length > 0;
        });
      }
    }, {
      key: "showAll",
      value: function showAll(filterType) {
        var filterArr = [];

        if (filterType === 'ENTITIES') {
          filterArr = this.entityFiltersList;
        } else if (filterType === 'METADATA') {
          filterArr = this.metadataFiltersList;
        }

        angular.forEach(filterArr, function (filter) {
          filter.isActive = true;
        });
        this.filterResults();
      }
    }, {
      key: "evaluateShowResultCount",
      value: function evaluateShowResultCount() {
        var lowerLimit = (this.currentPage - 1) * 10 + 1;
        var upperLimit = (this.currentPage - 1) * 10 + 10;
        upperLimit = upperLimit > this.searchResults.length ? this.searchResults.length : upperLimit;
        return this.searchResults.length === 0 ? '0' : lowerLimit + '-' + upperLimit;
      }
    }, {
      key: "getMatchedFiltersCount",
      value: function getMatchedFiltersCount() {
        var metadataFilterCount = 0;
        angular.forEach(this.metadataFiltersList, function (metadata) {
          if (metadata.count > 0) {
            metadataFilterCount++;
          }
        });
        return metadataFilterCount;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return TrackerResultsController;
  }();

  angular.module(PKG.name + '.feature.tracker').controller('TrackerResultsController', TrackerResultsController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/my-lineage-service.js */

  /*
   * Copyright © 2016-2018 Cask Data, Inc.
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
  var myLineageService = /*#__PURE__*/function () {
    myLineageService.$inject = ["$state", "myTrackerApi"];
    function myLineageService($state, myTrackerApi) {
      _classCallCheck(this, myLineageService);

      this.$state = $state;
      this.myTrackerApi = myTrackerApi;
    }
    /**
     *  Takes in the response from backend, and returns an object with list of
     *  nodes and connections.
     **/


    _createClass(myLineageService, [{
      key: "parseLineageResponse",
      value: function parseLineageResponse(response, params) {
        var _this = this;

        var currentActiveNode = ['dataset', params.namespace, params.entityId].join('.');
        var connections = [];
        var uniqueNodes = {};
        var nodes = [];
        /* SETTING NODES */

        angular.forEach(response.programs, function (value, key) {
          var entityId = value.entityId.program;
          var nodeObj = {
            label: entityId,
            id: key,
            nodeType: 'program',
            applicationId: value.entityId.application,
            entityId: entityId,
            entityType: _this.parseProgramType(value.entityId.type),
            displayType: value.entityId.type,
            icon: _this.getProgramIcon(value.entityId.type),
            runs: []
          };
          uniqueNodes[key] = nodeObj;
        });
        angular.forEach(response.data, function (value, key) {
          var data = _this.parseDataInfo(value);

          var nodeObj = {
            label: data.name,
            id: key,
            nodeType: 'data',
            entityId: data.name,
            entityType: data.type,
            displayType: data.displayType,
            icon: data.icon
          };
          uniqueNodes[key] = nodeObj;

          if (data.type === 'datasets') {
            var _params = {
              namespace: _this.$state.params.namespace,
              entityType: data.type,
              entityId: data.name
            };

            _this.myTrackerApi.getDatasetSystemProperties(_params).$promise.then(function (res) {
              var parsedType = res.type.split('.');
              nodeObj.displayType = parsedType[parsedType.length - 1];
            });
          }
        });
        /* SETTING CONNECTIONS */

        angular.forEach(response.relations, function (rel) {
          var isUnknownOrBoth = rel.access === 'both' || rel.access === 'unknown';

          if (rel.access === 'read' || isUnknownOrBoth) {
            var dataId = rel.data === currentActiveNode ? rel.data : rel.data + '-read';
            var programId = rel.data === currentActiveNode ? rel.program + '-read' : rel.program + '-write';
            connections.push({
              source: dataId,
              target: programId,
              type: 'read'
            });
            nodes.push({
              dataId: dataId,
              uniqueNodeId: rel.data,
              isLeftEdge: rel.data !== currentActiveNode
            });
            nodes.push({
              dataId: programId,
              uniqueNodeId: rel.program
            });
          }

          if (rel.access === 'write' || isUnknownOrBoth) {
            var _dataId = rel.data === currentActiveNode ? rel.data : rel.data + '-write';

            var _programId = rel.data === currentActiveNode ? rel.program + '-write' : rel.program + '-read';

            connections.push({
              source: _programId,
              target: _dataId,
              type: 'write'
            });
            nodes.push({
              dataId: _dataId,
              uniqueNodeId: rel.data,
              isRightEdge: rel.data !== currentActiveNode
            });
            nodes.push({
              dataId: _programId,
              uniqueNodeId: rel.program
            });
          }

          uniqueNodes[rel.program].runs = uniqueNodes[rel.program].runs.concat(rel.runs);
          uniqueNodes[rel.program].runs = _.uniq(uniqueNodes[rel.program].runs);
        });
        nodes = _.uniq(nodes, function (n) {
          return n.dataId;
        });
        var graph = this.getGraphLayout(nodes, connections);
        this.mapNodesLocation(nodes, graph);
        return {
          connections: connections,
          nodes: nodes,
          uniqueNodes: uniqueNodes,
          graph: graph
        };
      }
    }, {
      key: "secondLineageParser",
      value: function secondLineageParser(response, params) {
        var _this2 = this;

        var currentActiveNode = ['dataset', params.namespace, params.entityId].join('.');
        var connections = [];
        var uniqueNodes = {};
        var nodes = [];
        /* SETTING NODES */

        angular.forEach(response.programs, function (value, key) {
          var entityId = value.entityId.program;
          var nodeObj = {
            label: entityId,
            id: key,
            nodeType: 'program',
            applicationId: value.entityId.application,
            entityId: entityId,
            entityType: _this2.parseProgramType(value.entityId.type),
            displayType: value.entityId.type,
            icon: _this2.getProgramIcon(value.entityId.type),
            runs: []
          };
          uniqueNodes[key] = nodeObj;
        });
        angular.forEach(response.data, function (value, key) {
          var data = _this2.parseDataInfo(value);

          var nodeObj = {
            label: data.name,
            id: key,
            nodeType: 'data',
            entityId: data.name,
            entityType: data.type,
            displayType: data.displayType,
            icon: data.icon
          };
          uniqueNodes[key] = nodeObj;

          if (data.type === 'datasets') {
            var _params2 = {
              namespace: _this2.$state.params.namespace,
              entityType: data.type,
              entityId: data.name
            };

            _this2.myTrackerApi.getDatasetProperties(_params2).$promise.then(function (res) {
              var type = res.find(function (property) {
                return property.scope === 'SYSTEM' && property.name === 'type';
              });

              if (type) {
                var parsedType = type.value.split('.');
                nodeObj.displayType = parsedType[parsedType.length - 1];
              }
            });
          }
        });
        /* SETTING CONNECTIONS */

        angular.forEach(response.relations, function (rel) {
          var isUnknownOrBoth = rel.accesses.length > 1;

          if (!isUnknownOrBoth && rel.accesses[0] === 'read') {
            var dataId = rel.data;
            var programId = rel.program;
            connections.push({
              source: dataId,
              target: programId,
              type: 'read'
            });
            nodes.push({
              dataId: dataId,
              uniqueNodeId: rel.data,
              isLeftEdge: rel.data !== currentActiveNode
            });
            nodes.push({
              dataId: programId,
              uniqueNodeId: rel.program
            });
          }

          if (rel.accesses[0] !== 'read' || isUnknownOrBoth) {
            var _dataId2 = rel.data;
            var _programId2 = rel.program;
            connections.push({
              source: _programId2,
              target: _dataId2,
              type: 'write'
            });
            nodes.push({
              dataId: _dataId2,
              uniqueNodeId: rel.data,
              isRightEdge: rel.data !== currentActiveNode
            });
            nodes.push({
              dataId: _programId2,
              uniqueNodeId: rel.program
            });
          }

          uniqueNodes[rel.program].runs = uniqueNodes[rel.program].runs.concat(rel.runs);
          uniqueNodes[rel.program].runs = _.uniq(uniqueNodes[rel.program].runs);
        });
        nodes = _.uniq(nodes, function (n) {
          return n.dataId;
        });
        var graph = this.getGraphLayout(nodes, connections);
        this.mapNodesLocation(nodes, graph);
        return {
          connections: connections,
          nodes: nodes,
          uniqueNodes: uniqueNodes,
          graph: graph
        };
      }
    }, {
      key: "parseProgramType",
      value: function parseProgramType(programType) {
        switch (programType) {
          case 'Flow':
          case 'flow':
          case 'Flows':
          case 'flows':
            return 'flows';

          case 'Mapreduce':
          case 'mapreduce':
            return 'mapreduce';

          case 'Spark':
          case 'spark':
            return 'spark';

          case 'Worker':
          case 'worker':
          case 'Workers':
          case 'workers':
            return 'workers';

          case 'Workflow':
          case 'workflow':
          case 'Workflows':
          case 'workflows':
            return 'workflows';

          case 'Service':
          case 'service':
          case 'Services':
          case 'service':
            return 'services';
        }
      }
    }, {
      key: "parseDataInfo",
      value: function parseDataInfo(data) {
        if (data.entityId.entity === 'DATASET') {
          return {
            name: data.entityId.dataset,
            type: 'datasets',
            icon: 'icon-datasets',
            displayType: 'Dataset'
          };
        }
      }
    }, {
      key: "getProgramIcon",
      value: function getProgramIcon(programType) {
        var iconMap = {
          'Flow': 'icon-tigon',
          'Mapreduce': 'icon-mapreduce',
          'Spark': 'icon-spark',
          'Worker': 'icon-worker',
          'Workflow': 'icon-workflow',
          'Service': 'icon-service'
        };
        return iconMap[programType];
      }
    }, {
      key: "getGraphLayout",
      value: function getGraphLayout(nodes, connections) {
        var graph = new dagre.graphlib.Graph();
        graph.setGraph({
          nodesep: 50,
          ranksep: 90,
          rankdir: 'LR',
          marginx: 100,
          marginy: 50
        });
        graph.setDefaultEdgeLabel(function () {
          return {};
        });
        angular.forEach(nodes, function (node) {
          var id = node.dataId;
          graph.setNode(id, {
            width: 180,
            height: 60
          });
        });
        angular.forEach(connections, function (connection) {
          graph.setEdge(connection.source, connection.target);
        });
        dagre.layout(graph);
        return graph;
      }
    }, {
      key: "mapNodesLocation",
      value: function mapNodesLocation(nodes, graph) {
        angular.forEach(nodes, function (node) {
          node._uiLocation = {
            top: graph._nodes[node.dataId].y - 20 + 'px',
            // 20 = half of node height
            left: graph._nodes[node.dataId].x - 90 + 'px' // 90 = half of node width

          };
        });
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return myLineageService;
  }();

  angular.module(PKG.name + '.feature.tracker').service('myLineageService', myLineageService);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/my-tracker-api.js */

  /*
  * Copyright © 2016 Cask Data, Inc.
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
  myTrackerApi.$inject = ["myCdapUrl", "$resource", "myAuth", "myHelpers"];
  function myTrackerApi(myCdapUrl, $resource, myAuth, myHelpers) {
    var url = myCdapUrl.constructUrl,
        searchPath = '/namespaces/:namespace/metadata/search?limit=25&target=dataset',
        basePath = '/namespaces/:namespace/:entityType/:entityId',
        programPath = '/namespaces/:namespace/apps/:appId/:programType/:programId/runs/:runId',
        propertyPath = '/namespaces/:namespace/:entityType/:entityId/metadata/properties',
        exploreQueryPath = '/namespaces/:namespace/data/explore/queries',
        baseQueryPath = '/data/explore/queries/:handle',
        // tagsPath = '/namespaces/:namespace/apps/' + CDAP_UI_CONFIG.tracker.appId + '/services/' + CDAP_UI_CONFIG.tracker.serviceId + '/methods/v1/tags';
    tagsPath = "".concat(basePath, "/metadata/tags");
    return $resource(url({
      _cdapPath: searchPath
    }), {
      namespace: '@namespace'
    }, {
      search: myHelpers.getConfig('GET', 'REQUEST', searchPath, false),
      properties: myHelpers.getConfig('GET', 'REQUEST', basePath + '/metadata?responseFormat=v6', false),
      getLineage: myHelpers.getConfig('GET', 'REQUEST', basePath + '/lineage?collapse=access&collapse=run&collapse=component'),
      getProgramRunStatus: myHelpers.getConfig('GET', 'REQUEST', programPath),
      getDatasetDetail: myHelpers.getConfig('GET', 'REQUEST', '/namespaces/:namespace/data/datasets/:entityId'),
      // USER AND PREFERRED TAGS
      getUserTags: myHelpers.getConfig('GET', 'REQUEST', "".concat(tagsPath, "?scope=USER&responseFormat=v6"), false, {
        suppressErrors: true
      }),
      deleteTag: myHelpers.getConfig('DELETE', 'REQUEST', "".concat(tagsPath, "/:tag"), false, {
        suppressErrors: true
      }),
      addTag: myHelpers.getConfig('POST', 'REQUEST', tagsPath, false, {
        suppressErrors: true
      }),
      // METADATA PROPERTIES CONTROL
      getDatasetProperties: myHelpers.getConfig('GET', 'REQUEST', basePath + '/metadata/properties?&responseFormat=v6', false, {
        suppressErrors: true
      }),
      deleteEntityProperty: myHelpers.getConfig('DELETE', 'REQUEST', propertyPath + '/:key', false, {
        suppressErrors: true
      }),
      addEntityProperty: myHelpers.getConfig('POST', 'REQUEST', propertyPath, false, {
        suppressErrors: true
      }),
      // EXPLORE QUERY
      postQuery: myHelpers.getConfig('POST', 'REQUEST', exploreQueryPath),
      getQueryResults: myHelpers.getConfig('POST', 'REQUEST', baseQueryPath + '/next', true),
      getQuerySchema: myHelpers.getConfig('GET', 'REQUEST', baseQueryPath + '/schema', true)
    });
  }

  angular.module(PKG.name + '.feature.tracker').factory('myTrackerApi', myTrackerApi);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /directives/lineage/lineage.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  LineageController.$inject = ["$scope", "jsPlumb", "$timeout", "$state", "LineageStore", "myTrackerApi", "$window"];
  function LineageController($scope, jsPlumb, $timeout, $state, LineageStore, myTrackerApi, $window) {
    'ngInject';

    var vm = this;
    vm.linkDisabled = $state.params.iframe === 'true';

    function render() {
      jsPlumb.reset();

      if (vm.instance) {
        vm.instance.reset();
      }

      vm.nodes = LineageStore.getNodes();
      vm.connections = LineageStore.getConnections();
      vm.uniqueNodes = LineageStore.getUniqueNodes();
      vm.graph = LineageStore.getGraph();

      if (vm.nodes.length === 0) {
        return;
      }

      vm.graphInfo = vm.graph.graph();
      vm.graphInfo.width = vm.graphInfo.width < 920 ? 920 : vm.graphInfo.width;
      $timeout(function () {
        angular.forEach(vm.connections, function (conn) {
          vm.instance.connect({
            source: conn.source,
            target: conn.target,
            detachable: false,
            anchors: ['Right', 'Left']
          });
        });
        $timeout(function () {
          vm.instance.repaintEverything();
        });
        vm.scaleInfo = $scope.getScale(vm.graphInfo);
      });
    }

    LineageStore.registerOnChangeListener(render);
    jsPlumb.ready(function () {
      jsPlumb.setContainer('lineage-diagram');
      vm.instance = jsPlumb.getInstance({
        PaintStyle: {
          lineWidth: 2,
          strokeStyle: 'rgba(0,0,0, 1)'
        },
        Connector: ['Flowchart', {
          gap: 0,
          stub: [10, 15],
          alwaysRespectStubs: true,
          cornerRadius: 0
        }],
        ConnectionOverlays: [['Arrow', {
          location: 1,
          direction: 1,
          width: 10,
          length: 10
        }]],
        Endpoints: ['Blank', 'Blank']
      });
      render();
    });
    angular.element($window).on('resize', function () {
      vm.scaleInfo = $scope.getScale(vm.graphInfo);
    });

    vm.nodeClick = function (event, node) {
      var nodeInfo = vm.uniqueNodes[node.uniqueNodeId];

      if (nodeInfo.nodeType === 'data') {
        return;
      } else {
        event.preventDefault(); // prevent JS error on nonexistent state

        node.showPopover = true;
        node.popover = {
          activeRunIndex: 0,
          activeRunId: nodeInfo.runs[0],
          runInfo: {}
        };
        fetchRunStatus(nodeInfo, node.popover.activeRunId, node.popover.runInfo);
      }
    }; // This function is to enable user to click open data nodes in new tab


    vm.constructNodeLink = function (node) {
      if ($state.params.iframe) {
        return '-';
      }

      var nodeInfo = vm.uniqueNodes[node.uniqueNodeId];

      if (nodeInfo.nodeType === 'data') {
        return 'tracker.detail.entity.metadata({ entityType:Lineage.uniqueNodes[node.uniqueNodeId].entityType, entityId: Lineage.uniqueNodes[node.uniqueNodeId].entityId })';
      } else {
        // when you return non existant state, the href attribute never gets created
        return '-';
      }
    };

    vm.constructProgramLink = function (node) {
      var nodeInfo = vm.uniqueNodes[node.uniqueNodeId];
      var link = nodeInfo.entityType + '.detail.run({ appId: Lineage.uniqueNodes[node.uniqueNodeId].applicationId, programId: Lineage.uniqueNodes[node.uniqueNodeId].entityId, runid: node.popover.activeRunId })';
      return link;
    };

    vm.closePopover = function (event, node) {
      event.stopPropagation();
      node.showPopover = false;
    };

    vm.preventPropagation = function (event) {
      event.stopPropagation();
    };

    vm.nextRun = function (event, node) {
      event.stopPropagation();
      var nodeInfo = vm.uniqueNodes[node.uniqueNodeId];

      if (node.popover.activeRunIndex === nodeInfo.runs.length - 1) {
        node.popover.activeRunIndex = 0;
      } else {
        node.popover.activeRunIndex++;
      }

      node.popover.activeRunId = nodeInfo.runs[node.popover.activeRunIndex];
      fetchRunStatus(nodeInfo, node.popover.activeRunId, node.popover.runInfo);
    };

    vm.prevRun = function (event, node) {
      event.stopPropagation();
      var nodeInfo = vm.uniqueNodes[node.uniqueNodeId];

      if (node.popover.activeRunIndex === 0) {
        node.popover.activeRunIndex = nodeInfo.runs.length - 1;
      } else {
        node.popover.activeRunIndex--;
      }

      node.popover.activeRunId = nodeInfo.runs[node.popover.activeRunIndex];
      fetchRunStatus(nodeInfo, node.popover.activeRunId, node.popover.runInfo);
    };

    vm.navigationClick = function (event, node) {
      event.stopPropagation();
      event.preventDefault();
      var unique = vm.uniqueNodes[node.uniqueNodeId];
      $scope.navigationFunction().call($scope.context, unique.entityType, unique.entityId);
    };

    function fetchRunStatus(node, runId, runInfo) {
      var params = {
        namespace: $state.params.namespace,
        appId: node.applicationId,
        programType: node.entityType,
        programId: node.entityId,
        runId: runId,
        scope: $scope
      };
      myTrackerApi.getProgramRunStatus(params).$promise.then(function (res) {
        runInfo.start = res.start * 1000;
        runInfo.status = res.status;
        runInfo.duration = res.end ? (res.end - res.start) * 1000 : '-';
      });
    }

    $scope.$on('$destroy', function () {
      LineageStore.setDefaults();
    });
  }

  function LineageLink(scope, elem) {
    scope.getScale = function (graph) {
      var parentContainerWidth = elem.parent()[0].clientWidth;

      if (parentContainerWidth > graph.width) {
        return {
          scale: 1,
          padX: (parentContainerWidth - graph.width) / 2 + 'px',
          padY: 0
        };
      } else {
        var scale = parentContainerWidth / graph.width;
        return {
          scale: scale,
          padX: (graph.width * scale - graph.width) / 2 + 'px',
          padY: (graph.height * scale - graph.height) / 2 + 'px'
        };
      }
    };
  }

  angular.module(PKG.name + '.feature.tracker').directive('myLineageDiagram', function () {
    return {
      restrict: 'E',
      scope: {
        navigationFunction: '&',
        context: '='
      },
      templateUrl: '/assets/features/tracker/directives/lineage/lineage.html',
      controller: LineageController,
      controllerAs: 'Lineage',
      link: LineageLink
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /directives/lineage/flux/lineage-actions.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  var LineageActions = /*#__PURE__*/function () {
    LineageActions.$inject = ["LineageStore"];
    function LineageActions(LineageStore) {
      _classCallCheck(this, LineageActions);

      this.LineageStore = LineageStore;
    }

    _createClass(LineageActions, [{
      key: "loadLineageData",
      value: function loadLineageData(data, params, method) {
        this.LineageStore.loadLineageData(data, params, method);
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return LineageActions;
  }();

  LineageActions.$inject = ['LineageStore'];
  angular.module(PKG.name + '.feature.tracker').service('LineageActions', LineageActions);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /directives/lineage/flux/lineage-store.js */

  /*
   * Copyright © 2016 Cask Data, Inc.
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
  var LineageStore = /*#__PURE__*/function () {
    LineageStore.$inject = ["$state", "myLineageService"];
    function LineageStore($state, myLineageService) {
      _classCallCheck(this, LineageStore);

      this.myLineageService = myLineageService;
      this.state = {};
      this.setDefaults();
    }

    _createClass(LineageStore, [{
      key: "setDefaults",
      value: function setDefaults() {
        this.state = {
          nodes: [],
          uniqueNodes: {},
          connections: [],
          graph: {}
        };
        this.changeListeners = [];
      }
    }, {
      key: "registerOnChangeListener",
      value: function registerOnChangeListener(callback) {
        this.changeListeners.push(callback);
      }
    }, {
      key: "emitChange",
      value: function emitChange() {
        this.changeListeners.forEach(function (callback) {
          return callback();
        });
      }
    }, {
      key: "loadLineageData",
      value: function loadLineageData(data, params, method) {
        var obj;

        if (method === 'duplicate') {
          obj = this.myLineageService.parseLineageResponse(data, params);
        } else {
          obj = this.myLineageService.secondLineageParser(data, params);
        }

        this.state.nodes = obj.nodes;
        this.state.uniqueNodes = obj.uniqueNodes;
        this.state.connections = obj.connections;
        this.state.graph = obj.graph;
        this.emitChange();
      }
    }, {
      key: "getNodes",
      value: function getNodes() {
        return this.state.nodes;
      }
    }, {
      key: "getUniqueNodes",
      value: function getUniqueNodes() {
        return this.state.uniqueNodes;
      }
    }, {
      key: "getConnections",
      value: function getConnections() {
        return this.state.connections;
      }
    }, {
      key: "getGraph",
      value: function getGraph() {
        return this.state.graph;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return LineageStore;
  }();

  LineageStore.$inject = ['$state', 'myLineageService'];
  angular.module(PKG.name + '.feature.tracker').service('LineageStore', LineageStore);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});