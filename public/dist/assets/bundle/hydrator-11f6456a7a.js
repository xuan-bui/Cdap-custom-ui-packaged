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
  angular.module(PKG.name, [angular.module(PKG.name + '.features', [PKG.name + '.feature.hydrator']).name, angular.module(PKG.name + '.commons', [angular.module(PKG.name + '.services', ['ngAnimate', 'ngSanitize', 'ngResource', 'ngStorage', 'ui.router', 'ngCookies']).name, angular.module(PKG.name + '.filters', [PKG.name + '.services']).name, 'mgcrea.ngStrap.datepicker', 'mgcrea.ngStrap.timepicker', 'mgcrea.ngStrap.core', 'mgcrea.ngStrap.helpers.dimensions', 'mgcrea.ngStrap.alert', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.dropdown', 'mgcrea.ngStrap.typeahead', 'mgcrea.ngStrap.select', 'mgcrea.ngStrap.collapse', // 'mgcrea.ngStrap.modal',
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
  }).config(["MyDataSourceProvider", function (MyDataSourceProvider) {
    MyDataSourceProvider.defaultInterval = 5;
  }]).config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).run(["$rootScope", function ($rootScope) {
    $rootScope.defaultPollInterval = 10000;
  }]).run(["$rootScope", "MY_CONFIG", "myAuth", "MYAUTH_EVENT", function ($rootScope, MY_CONFIG, myAuth, MYAUTH_EVENT) {
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

            if (window.CDAP_CONFIG.securityEnabled && $rootScope.currentUser.token) {
              // Accessing stuff from $rootScope is bad. This is done as to resolve circular dependency.
              // $http <- myAuthPromise <- myAuth <- $http <- $templateFactory <- $view <- $state
              extendConfig.headers.Authorization = 'Bearer ' + $rootScope.currentUser.token;
            }

            extendConfig.headers.sessionToken = window.CaskCommon.SessionTokenStore["default"].getState();
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
  }]).run(function () {
    window.CaskCommon.StatusFactory.startPollingForBackendStatus();
  }).run(["MYSOCKET_EVENT", "myAlert", "EventPipe", function (MYSOCKET_EVENT, myAlert, EventPipe) {
    EventPipe.on(MYSOCKET_EVENT.message, function (data) {
      if (data.statusCode > 399 && !data.resource.suppressErrors) {
        myAlert({
          title: data.statusCode.toString(),
          content: data.response || 'Server had an issue, please try refreshing the page',
          type: 'danger'
        });
      } // The user doesn't need to know that the backend node
      // is unable to connect to CDAP. Error messages add no
      // more value than the pop showing that the FE is waiting
      // for system to come back up. Most of the issues are with
      // connect, other than that pass everything else to user.


      if (data.warning && data.error.syscall !== 'connect') {
        myAlert({
          content: data.warning,
          type: 'warning'
        });
      }
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
      myLoadingService.hideLoadingIcon();
      /**
       *  This is to make sure that the sroll position goes back to the top when user
       *  change state. UI Router has this function ($anchorScroll), but for some
       *  reason it is not working.
       **/

      $window.scrollTo(0, 0);
    });
    EventPipe.on(MYSOCKET_EVENT.reconnected, function () {
      $log.log('[DataSource] reconnected.');
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
  angular.module(PKG.name + '.feature.hydrator', [PKG.name + '.commons']).constant('IMPLICIT_SCHEMA', {
    clf: '{"type":"record","name":"etlSchemaBody","fields":[{"name":"remote_host","type":["string","null"]},{"name":"remote_login","type":["string","null"]},{"name":"auth_user","type":["string","null"]},{"name":"request_time","type":["string","null"]},{"name":"request","type":["string","null"]},{"name":"status","type":["int","null"]},{"name":"content_length","type":["int","null"]},{"name":"referrer","type":["string","null"]},{"name":"user_agent","type":["string","null"]}]}',
    syslog: '{"type":"record","name":"etlSchemaBody","fields":[{"name":"timestamp","type":["string","null"]},{"name":"logsource","type":["string","null"]},{"name":"program","type":["string","null"]},{"name":"message","type":["string","null"]},{"name":"pid","type":["string","null"]}]}',
    binary: '{"type":"record","name":"etlSchemaBody","fields":[{"name":"body","type":"bytes"}]}'
  }).constant('HYDRATOR_DEFAULT_VALUES', window.CaskCommon.HYDRATOR_DEFAULT_VALUES);
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
  angular.module(PKG.name + '.feature.hydrator').controller('HydratorHomeController', ["$state", "$stateParams", "rNsList", "mySessionStorage", "myLoadingService", "$window", function ($state, $stateParams, rNsList, mySessionStorage, myLoadingService, $window) {
    if (!rNsList.length) {
      $state.go('unauthorized');
      return;
    } // Needed to inject StatusFactory here for angular to instantiate the service and start polling.
    // check that $state.params.namespace is valid
    // Access local storage for currently set namespace; if none is currently set resort to default ns


    var ns = $state.params.namespace;
    var defaultNS = localStorage.getItem('DefaultNamespace');
    var namespaceToUse = ns ? ns : defaultNS;
    var validNamespace = rNsList.find(function (namespace) {
      return namespace.name === namespaceToUse;
    });

    function checkNamespace(ns) {
      return rNsList.filter(function (namespace) {
        return namespace.name === ns;
      }).length;
    }

    var PREFKEY = 'feature.home.ns.latest';

    if (validNamespace) {
      mySessionStorage.get(PREFKEY).then(function (latest) {
        var ns;

        if (latest && checkNamespace(latest)) {
          ns = latest;
        } else if (checkNamespace('default')) {
          // check for default
          ns = 'default';
        } else {
          ns = rNsList[0].name;
        }

        $window.location.href = $window.getHydratorUrl({
          stateName: 'hydrator.list',
          stateParams: {
            namespace: ns
          }
        });
      });
    } else {
      mySessionStorage.set(PREFKEY, $state.params.namespace);
      $window.location.href = $window.getHydratorUrl({
        stateName: 'hydrator.list',
        stateParams: {
          namespace: namespaceToUse
        }
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
  angular.module(PKG.name + '.feature.hydrator').config(["$stateProvider", "$urlRouterProvider", "MYAUTH_ROLE", "GLOBALS", function ($stateProvider, $urlRouterProvider, MYAUTH_ROLE, GLOBALS) {
    var theme = window.CaskCommon.ThemeHelper.Theme;
    var productName = theme.productName;
    var featureName = theme.featureNames.pipelines;
    var uiSupportedArtifacts = [GLOBALS.etlDataPipeline];

    if (theme.showRealtimePipeline !== false) {
      uiSupportedArtifacts.push(GLOBALS.etlDataStreams);
    }

    if (theme.showSqlPipeline !== false) {
      uiSupportedArtifacts.push(GLOBALS.eltSqlPipeline);
    }

    $urlRouterProvider.otherwise(function () {
      //Unmatched route, will show 404
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
      controller: 'HydratorHomeController'
    }).state('hydrator', {
      url: '/ns/:namespace',
      "abstract": true,
      template: '<ui-view/>',
      title: 'Hydrator',
      resolve: {
        sessionToken: function sessionToken() {
          window.CaskCommon.SessionTokenStore.fetchSessionToken();
        },
        // This is f%&$*d up. We need to cause this manual delay for react to finish its click handlers
        // before angular takes up the state change routing -_-.
        rDelay: ["$q", function rDelay($q) {
          var defer = $q.defer();
          setTimeout(function () {
            defer.resolve();
          });
          return defer.promise;
        }],
        rResetPreviousPageLevelError: function rResetPreviousPageLevelError() {
          window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, {
            reset: true
          });
        },
        rValidNamespace: ["$stateParams", function rValidNamespace($stateParams) {
          return window.CaskCommon.validateNamespace($stateParams.namespace);
        }]
      },
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'development'
      }
    }).state('hydrator.create', {
      url: '/studio?artifactType&draftId&workspaceId&configParams&rulesengineid&resourceCenterId&cloneId',
      onEnter: function onEnter() {
        document.title = "".concat(productName, " | Studio");
      },
      params: {
        data: null,
        isClone: null
      },
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'hydratorStudioPlusPlus'
      },
      resolve: {
        rCDAPVersion: ["$q", function rCDAPVersion($q) {
          var defer = $q.defer();
          var cdapversion = window.CaskCommon.VersionStore.getState().version;

          if (cdapversion) {
            defer.resolve(cdapversion);
            return defer.promise;
          }

          var subscription = window.CaskCommon.VersionStore.subscribe(function () {
            var cdapversion = window.CaskCommon.VersionStore.getState().version;

            if (cdapversion) {
              defer.resolve(cdapversion);
              subscription();
            }
          });
          return defer.promise;
        }],
        rResetPreviousPageLevelError: function rResetPreviousPageLevelError() {
          window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, {
            reset: true
          });
        },
        rConfig: ["rCDAPVersion", "$stateParams", "mySettings", "$q", "myHelpers", "$window", "HydratorPlusPlusHydratorService", "myPipelineApi", function rConfig(rCDAPVersion, $stateParams, mySettings, $q, myHelpers, $window, HydratorPlusPlusHydratorService, myPipelineApi) {
          var defer = $q.defer();

          var processDraft = function processDraft(draft) {
            if (angular.isObject(draft)) {
              var isVersionInRange = HydratorPlusPlusHydratorService.isVersionInRange({
                supportedVersion: rCDAPVersion,
                versionRange: draft.artifact.version
              });

              if (isVersionInRange) {
                draft.artifact.version = rCDAPVersion;
              } else {
                defer.resolve({
                  valid: false,
                  config: draft,
                  upgrade: true
                });
                return;
              }

              defer.resolve({
                valid: true,
                config: draft
              });
            } else {
              defer.resolve({
                valid: false
              });
            }
          };

          if ($stateParams.data) {
            // This is being used while cloning a published a pipeline.
            var isVersionInRange = HydratorPlusPlusHydratorService.isVersionInRange({
              supportedVersion: rCDAPVersion,
              versionRange: $stateParams.data.artifact.version
            });

            if (isVersionInRange) {
              $stateParams.data.artifact.version = rCDAPVersion;
            } else {
              defer.resolve({
                valid: false
              });
            }

            defer.resolve({
              config: $stateParams.data,
              valid: true
            });
            return defer.promise;
          }

          if ($stateParams.draftId) {
            var params = {
              context: $stateParams.namespace,
              draftId: $stateParams.draftId
            };
            myPipelineApi.getDraft(params).$promise.then(processDraft, function () {
              mySettings.get('hydratorDrafts', true).then(function (res) {
                processDraft(myHelpers.objectQuery(res, $stateParams.namespace, $stateParams.draftId));
              });
            });
          } else if ($stateParams.configParams) {
            // This is being used while adding a dataset/stream as source/sink from metadata to pipeline studio
            try {
              var config = JSON.parse($stateParams.configParams);
              defer.resolve({
                valid: true,
                config: config
              });
            } catch (e) {
              defer.resolve({
                valid: false
              });
            }
          } else if ($stateParams.workspaceId) {
            // This is being used by dataprep to pipelines transition
            try {
              var configParams = $window.localStorage.getItem($stateParams.workspaceId);

              var _config = JSON.parse(configParams);

              defer.resolve({
                valid: true,
                config: _config
              });
            } catch (e) {
              defer.resolve({
                valid: false
              });
            }

            $window.localStorage.removeItem($stateParams.workspaceId);
          } else if ($stateParams.rulesengineid) {
            try {
              var _configParams = $window.localStorage.getItem($stateParams.rulesengineid);

              var _config2 = JSON.parse(_configParams);

              defer.resolve({
                valid: true,
                config: _config2
              });
            } catch (e) {
              defer.resolve({
                valid: false
              });
            }

            $window.localStorage.removeItem($stateParams.rulesengineid);
          } else if ($stateParams.cloneId) {
            try {
              var _configParams2 = $window.localStorage.getItem($stateParams.cloneId);

              var _config3 = JSON.parse(_configParams2);

              defer.resolve({
                valid: true,
                config: _config3
              });
            } catch (e) {
              defer.resolve({
                valid: false
              });
            }

            $window.localStorage.removeItem($stateParams.cloneId);
          } else {
            defer.resolve({
              valid: false
            });
          }

          return defer.promise;
        }],
        rSelectedArtifact: ["rCDAPVersion", "$stateParams", "$q", "myPipelineApi", function rSelectedArtifact(rCDAPVersion, $stateParams, $q, myPipelineApi) {
          var defer = $q.defer();

          var isArtifactValid = function isArtifactValid(backendArtifacts, artifact) {
            return backendArtifacts.filter(function (a) {
              return a.name === artifact && a.version === rCDAPVersion;
            }).length;
          };

          var isAnyUISupportedArtifactPresent = function isAnyUISupportedArtifactPresent(backendArtifacts) {
            return backendArtifacts.filter(function (artifact) {
              return artifact.version === rCDAPVersion;
            }).filter(function (artifact) {
              return uiSupportedArtifacts.indexOf(artifact.name) !== -1;
            });
          };

          var getValidUISupportedArtifact = function getValidUISupportedArtifact(backendArtifacts) {
            var validUISupportedArtifact = isAnyUISupportedArtifactPresent(backendArtifacts);
            return validUISupportedArtifact.length ? validUISupportedArtifact[0] : false;
          };

          var showError = function showError(error) {
            window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, error);
          };

          myPipelineApi.fetchArtifacts({
            namespace: $stateParams.namespace
          }).$promise.then(function (artifactsFromBackend) {
            var showNoArtifactsError = function showNoArtifactsError() {
              showError({
                data: GLOBALS.en.hydrator.studio.error['MISSING-SYSTEM-ARTIFACTS'],
                statusCode: 404
              });
            };

            var chooseDefaultArtifact = function chooseDefaultArtifact() {
              if (!isArtifactValid(artifactsFromBackend, GLOBALS.etlDataPipeline)) {
                if (!isAnyUISupportedArtifactPresent(artifactsFromBackend).length) {
                  return showNoArtifactsError();
                } else {
                  $stateParams.artifactType = getValidUISupportedArtifact(artifactsFromBackend).name;
                  defer.resolve($stateParams.artifactType);
                }
              } else {
                $stateParams.artifactType = GLOBALS.etlDataPipeline;
                defer.resolve($stateParams.artifactType);
              }
            };

            if (!artifactsFromBackend.length) {
              return showNoArtifactsError();
            }

            if (!isArtifactValid(artifactsFromBackend, $stateParams.artifactType)) {
              chooseDefaultArtifact();
            } else {
              defer.resolve($stateParams.artifactType);
            }
          }, function (err) {
            showError(err);
          });
          return defer.promise;
        }],
        rArtifacts: ["rCDAPVersion", "myPipelineApi", "$stateParams", "$q", "HydratorPlusPlusOrderingFactory", function rArtifacts(rCDAPVersion, myPipelineApi, $stateParams, $q, HydratorPlusPlusOrderingFactory) {
          var defer = $q.defer();
          myPipelineApi.fetchArtifacts({
            namespace: $stateParams.namespace
          }).$promise.then(function (res) {
            if (!res.length) {
              return;
            } else {
              var filteredRes = res.filter(function (artifact) {
                return artifact.version === rCDAPVersion;
              }).filter(function (r) {
                return uiSupportedArtifacts.indexOf(r.name) !== -1;
              });
              filteredRes = filteredRes.map(function (r) {
                r.label = HydratorPlusPlusOrderingFactory.getArtifactDisplayName(r.name);
                return r;
              });
              defer.resolve(filteredRes);
            }
          });
          return defer.promise;
        }],
        rVersion: ["$state", "MyCDAPDataSource", function rVersion($state, MyCDAPDataSource) {
          var dataSource = new MyCDAPDataSource();
          return dataSource.request({
            _cdapPath: '/version'
          });
        }]
      },
      views: {
        '': {
          templateUrl: '/assets/features/hydrator/templates/create/studio.html',
          controller: 'HydratorPlusPlusStudioCtrl as HydratorPlusPlusStudioCtrl'
        },
        'canvas@hydrator.create': {
          templateUrl: '/assets/features/hydrator/templates/create/canvas.html',
          controller: 'HydratorPlusPlusCreateCanvasCtrl',
          controllerAs: 'CanvasCtrl'
        },
        'leftpanel@hydrator.create': {
          templateUrl: '/assets/features/hydrator/templates/create/leftpanel.html',
          controller: 'HydratorPlusPlusLeftPanelCtrl as HydratorPlusPlusLeftPanelCtrl'
        },
        'toppanel@hydrator.create': {
          templateUrl: '/assets/features/hydrator/templates/create/toppanel.html',
          controller: 'HydratorPlusPlusTopPanelCtrl as HydratorPlusPlusTopPanelCtrl'
        }
      },
      onExit: ["$uibModalStack", function onExit($uibModalStack) {
        $uibModalStack.dismissAll();
      }]
    }).state('hydrator.detail', {
      url: '/view/:pipelineId?runid',
      data: {
        authorizedRoles: MYAUTH_ROLE.all,
        highlightTab: 'hydratorList'
      },
      onEnter: ["$stateParams", function onEnter($stateParams) {
        document.title = "".concat(productName, " | ").concat(featureName, " | ").concat($stateParams.pipelineId);
      }],
      resolve: {
        rPipelineDetail: ["$stateParams", "$q", "myPipelineApi", "myAlertOnValium", "$window", function rPipelineDetail($stateParams, $q, myPipelineApi, myAlertOnValium, $window) {
          var params = {
            namespace: $stateParams.namespace,
            pipeline: $stateParams.pipelineId
          };
          return myPipelineApi.get(params).$promise.then(function (pipelineDetail) {
            var config = pipelineDetail.configuration;

            try {
              config = JSON.parse(config);
            } catch (e) {
              myAlertOnValium.show({
                type: 'danger',
                content: 'Invalid configuration JSON.'
              });
              $q.reject(false); // FIXME: We should not have done this. But ui-router when rejected on a 'resolve:' function takes it to the parent state apparently
              // and in our case the parent state is 'hydrator and since its an abstract state it goes to home.'

              $window.location.href = $window.getHydratorUrl({
                stateName: 'hydrator.list',
                stateParams: {
                  namespace: $stateParams.namespace
                }
              });
              return;
            }

            if (!config.stages) {
              myAlertOnValium.show({
                type: 'danger',
                content: 'Pipeline is created using older version of hydrator. Please upgrage the pipeline to newer version(3.4) to view in UI.'
              });
              $q.reject(false); // FIXME: We should not have done this. But ui-router when rejected on a 'resolve:' function takes it to the parent state apparently
              // and in our case the parent state is 'hydrator and since its an abstract state it goes to home.'

              $window.location.href = $window.getHydratorUrl({
                stateName: 'hydrator.list',
                stateParams: {
                  namespace: $stateParams.namespace
                }
              });
              return;
            }

            return $q.resolve(pipelineDetail);
          }, function (err) {
            window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, err);
          });
        }],
        rResetPreviousPageLevelError: function rResetPreviousPageLevelError() {
          window.CaskCommon.ee.emit(window.CaskCommon.globalEvents.PAGE_LEVEL_ERROR, {
            reset: true
          });
        }
      },
      ncyBreadcrumb: {
        parent: 'apps.list',
        label: '{{$state.params.pipelineId}}'
      },
      views: {
        '': {
          templateUrl: '/assets/features/hydrator/templates/detail.html',
          controller: 'HydratorPlusPlusDetailCtrl',
          controllerAs: 'DetailCtrl'
        },
        'toppanel@hydrator.detail': {
          templateUrl: '/assets/features/hydrator/templates/detail/top-panel.html'
        },
        'canvas@hydrator.detail': {
          templateUrl: '/assets/features/hydrator/templates/detail/canvas.html',
          controller: 'HydratorPlusPlusDetailCanvasCtrl',
          controllerAs: 'CanvasCtrl'
        }
      },
      onExit: ["$uibModalStack", function onExit($uibModalStack) {
        $uibModalStack.dismissAll();
      }]
    });
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/detail-ctrl.js */

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
  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusDetailCtrl', ["rPipelineDetail", "$scope", "$stateParams", "PipelineAvailablePluginsActions", "GLOBALS", "myHelpers", function (rPipelineDetail, $scope, $stateParams, PipelineAvailablePluginsActions, GLOBALS, myHelpers) {
    var _this = this;

    // FIXME: This should essentially be moved to a scaffolding service that will do stuff for a state/view
    var pipelineDetailsActionCreator = window.CaskCommon.PipelineDetailActionCreator;
    var pipelineMetricsActionCreator = window.CaskCommon.PipelineMetricsActionCreator;
    var pipelineConfigurationsActionCreator = window.CaskCommon.PipelineConfigurationsActionCreator;
    this.pipelineType = rPipelineDetail.artifact.name;
    var programType = GLOBALS.programType[this.pipelineType];
    var programTypeForRunsCount = GLOBALS.programTypeForRunsCount[this.pipelineType];
    var programName = GLOBALS.programId[this.pipelineType];
    var scheduleId = GLOBALS.defaultScheduleId;
    var currentRun, metricsObservable, runsPoll, runsCountPoll;
    var pluginsFetched = false;
    pipelineDetailsActionCreator.init(rPipelineDetail);
    var runid = $stateParams.runid;
    this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    this.pageLevelError = null;
    var globalEvents = window.CaskCommon.globalEvents;
    this.eventEmitter.on(globalEvents.PAGE_LEVEL_ERROR, function (error) {
      if (error.reset === true) {
        _this.pageLevelError = null;
      } else {
        _this.pageLevelError = myHelpers.handlePageLevelError(error);
      }
    });
    var runsFetch = pipelineDetailsActionCreator.getRuns({
      namespace: $stateParams.namespace,
      appId: rPipelineDetail.name,
      programType: programType,
      programName: programName
    });
    runsFetch.subscribe(function () {
      var _window$CaskCommon$Pi = window.CaskCommon.PipelineDetailStore.getState(),
          runs = _window$CaskCommon$Pi.runs;

      var doesCurrentRunExists = _.find(runs, function (run) {
        return run.runid === runid;
      });
      /**
       * We do this here because of this usecase,
       *
       * 1. User goes to pipeline which has 130 runs
       * 2. Opens up summary and clicks on the 30th run from the runs history graph
       * 3. User is now at 30 of 130 runs
       * 4. User starts more new runs
       * 5. At later point when the user refreshes the UI, the current run id in the url won't be in the latest 100 runs
       *
       * So instead of having a runid in the url and showing the information of latest run (which is incorrect) we fetch
       * the run detail and add it to the runs.
       *
       * This will render the run number incorrect but its ok compared to the whole run information being incorrect.
       */


      if (runid && !doesCurrentRunExists) {
        pipelineDetailsActionCreator.getRunDetails({
          namespace: $stateParams.namespace,
          appId: rPipelineDetail.name,
          programType: programType,
          programName: programName,
          runid: runid
        }).subscribe(function (runDetails) {
          var _window$CaskCommon$Pi2 = window.CaskCommon.PipelineDetailStore.getState(),
              runs = _window$CaskCommon$Pi2.runs;

          runs.push(runDetails);
          pipelineDetailsActionCreator.setCurrentRunId(runid);
          pipelineDetailsActionCreator.setRuns(runs);
        });
      } else if (runid) {
        pipelineDetailsActionCreator.setCurrentRunId(runid);
      }

      pollRuns();
    });
    pollRunsCount();

    function pollRuns() {
      runsPoll = pipelineDetailsActionCreator.pollRuns({
        namespace: $stateParams.namespace,
        appId: rPipelineDetail.name,
        programType: programType,
        programName: programName
      });
    }

    function pollRunsCount() {
      runsCountPoll = pipelineDetailsActionCreator.pollRunsCount({
        namespace: $stateParams.namespace,
        appId: rPipelineDetail.name,
        programType: programTypeForRunsCount,
        programName: programName
      });
    }

    pipelineDetailsActionCreator.fetchScheduleStatus({
      namespace: $stateParams.namespace,
      appId: rPipelineDetail.name,
      scheduleId: scheduleId
    });
    var pipelineDetailStoreSubscription = window.CaskCommon.PipelineDetailStore.subscribe(function () {
      var pipelineDetailStoreState = window.CaskCommon.PipelineDetailStore.getState();

      if (!pluginsFetched) {
        var pluginsToFetchDetailsFor = pipelineDetailStoreState.config.stages.concat(pipelineDetailStoreState.config.postActions || []);
        PipelineAvailablePluginsActions.fetchPluginsForDetails($stateParams.namespace, pluginsToFetchDetailsFor);
        pluginsFetched = true;
      }

      var latestRun = pipelineDetailStoreState.currentRun;

      if (!latestRun || !latestRun.runid) {
        return;
      } // let latestRunId = latestRun.runid;


      if (currentRun && currentRun.runid === latestRun.runid && currentRun.status === latestRun.status && currentRun.status !== 'RUNNING') {
        return;
      } // When current run id changes reset the metrics in the DAG.


      if (currentRun && currentRun.runid !== latestRun.runid) {
        pipelineMetricsActionCreator.reset();
      }

      currentRun = latestRun;
      var metricProgramType = programType === 'workflows' ? 'workflow' : programType;

      var metricParams = _defineProperty({
        namespace: $stateParams.namespace,
        app: rPipelineDetail.name,
        run: latestRun.runid
      }, metricProgramType, programName);

      if (metricsObservable) {
        metricsObservable.unsubscribe();
      }

      if (latestRun.status !== 'RUNNING') {
        pipelineMetricsActionCreator.getMetrics(metricParams);
      } else {
        metricsObservable = pipelineMetricsActionCreator.pollForMetrics(metricParams);
      }
    });
    this.eventEmitter.on(window.CaskCommon.WINDOW_ON_FOCUS, function () {
      pollRuns();
      pollRunsCount();
    });
    this.eventEmitter.on(window.CaskCommon.WINDOW_ON_BLUR, function () {
      if (metricsObservable) {
        metricsObservable.unsubscribe();
      }

      if (runsPoll) {
        runsPoll.unsubscribe();
      }

      if (runsCountPoll) {
        runsCountPoll.unsubscribe();
      }
    });
    $scope.$on('$destroy', function () {
      // FIXME: This should essentially be moved to a scaffolding service that will do stuff for a state/view
      if (runsPoll) {
        runsPoll.unsubscribe();
      }

      if (runsCountPoll) {
        runsCountPoll.unsubscribe();
      }

      if (metricsObservable) {
        metricsObservable.unsubscribe();
      }

      pipelineConfigurationsActionCreator.reset();
      pipelineDetailsActionCreator.reset();
      pipelineDetailStoreSubscription();
      pipelineMetricsActionCreator.reset();
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
  /* /services/canvas-factory.js */

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
   * distributed under the License is distribut
   ed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
   * License for the specific language governing permissions and limitations under
   * the License.
   */
  angular.module(PKG.name + '.feature.hydrator').factory('HydratorPlusPlusCanvasFactory', ["myHelpers", "$q", "myAlertOnValium", "GLOBALS", function (myHelpers, $q, myAlertOnValium, GLOBALS) {
    /*
      This is the inner utility function that is used once we have a source node to start our traversal.
    */
    function addConnectionsInOrder(sourceConn, finalConnections, originalConnections) {
      if (sourceConn.visited) {
        return finalConnections;
      }

      sourceConn.visited = true;
      finalConnections.push(sourceConn);
      var nextConnections = originalConnections.filter(function (conn) {
        if (sourceConn.to === conn.from) {
          return conn;
        }
      });

      if (nextConnections.length) {
        nextConnections.forEach(function (nextConnection) {
          return addConnectionsInOrder(nextConnection, finalConnections, originalConnections);
        });
      }
    }
    /*
      This function exists because if the user adds all tranforms and sinks but no source.
      So now technically we can show the config as list of transforms and sinks but can't traverse
      through the list of connections if we always want to start with a source.
      This is for a use case where we want to start with a transform that doesn't has any input nodes (assuming that is where source will end up).
       transform1 -> transform2 -> transform3 -- Sink1
                                             |_ Sink2
                                             |_ Sink3
    */


    function findTransformThatIsSource(originalConnections) {
      var transformAsSource = {};

      function isSource(c) {
        if (c.to === connection.from) {
          return c;
        }
      }

      for (var i = 0; i < originalConnections.length; i++) {
        var connection = originalConnections[i];
        var isSoureATarget = originalConnections.filter(isSource);

        if (!isSoureATarget.length) {
          transformAsSource = connection;
          break;
        }
      }

      return transformAsSource;
    }
    /*
      Utility that will take list of connections in any order and will order it with source -> [transforms] -> [sinks].
      This will help us to construct the config that we need to send to the backend.
      Eventually this will be removed and the backend doesn't expect the config anymore.
      All the backend requires is list of nodes and list of connections and this functionaity will be moved there.
    */


    function orderConnections(connections, appType, nodes) {
      var orderConditionConnections = function orderConditionConnections(conditionNodes) {
        angular.forEach(conditionNodes, function (conditionNode) {
          var trueConnIndex = _.findIndex(finalConnections, function (conn) {
            return conn.from === conditionNode && conn.condition === true;
          });

          var falseConnIndex = _.findIndex(finalConnections, function (conn) {
            return conn.from === conditionNode && conn.condition === false;
          });

          if (trueConnIndex === -1 || falseConnIndex === -1 || trueConnIndex === falseConnIndex - 1) {
            return;
          }

          var falseConn = finalConnections.splice(falseConnIndex, 1)[0];

          if (falseConnIndex < trueConnIndex) {
            finalConnections.splice(trueConnIndex, 0, falseConn);
          } else {
            finalConnections.splice(trueConnIndex + 1, 0, falseConn);
          }
        });
      };

      var orderAlertErrorConnections = function orderAlertErrorConnections(alertOrErrorNodes) {
        var isErrorNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        angular.forEach(alertOrErrorNodes, function (node) {
          var lastConnToThisNodeIndex = _.findLastIndex(finalConnections, function (conn) {
            return conn.to === node;
          });

          if (lastConnToThisNodeIndex === -1) {
            return;
          }

          var lastConnToThisNode = finalConnections[lastConnToThisNodeIndex];
          var lastNodeToThisNode = lastConnToThisNode.from;
          var nodesToExclude;

          if (isErrorNodes) {
            nodesToExclude = errorNodes.concat(alertNodes);
          } else {
            nodesToExclude = alertNodes;
          }

          var lastNonAlertErrorConnectionFromPrevNodeIndex = _.findLastIndex(finalConnections, function (conn) {
            return conn.from === lastNodeToThisNode && nodesToExclude.indexOf(conn.to) === -1;
          });

          if (lastNonAlertErrorConnectionFromPrevNodeIndex === -1 || lastNonAlertErrorConnectionFromPrevNodeIndex === lastConnToThisNodeIndex - 1) {
            return;
          }

          finalConnections.splice(lastConnToThisNodeIndex, 1);

          if (lastConnToThisNodeIndex < lastNonAlertErrorConnectionFromPrevNodeIndex) {
            finalConnections.splice(lastNonAlertErrorConnectionFromPrevNodeIndex, 0, lastConnToThisNode);
          } else {
            finalConnections.splice(lastNonAlertErrorConnectionFromPrevNodeIndex + 1, 0, lastConnToThisNode);
          }
        });
      };

      var originalConnections = angular.copy(connections);

      if (!originalConnections.length) {
        return originalConnections;
      }

      var finalConnections = [];
      var parallelConnections = [];
      var nodesMap = {};
      var conditionNodes = [];
      var alertNodes = [];
      var errorNodes = [];
      nodes.forEach(function (n) {
        var nodeName = n.name;
        nodesMap[nodeName] = n;

        if (n.type === 'condition') {
          conditionNodes.push(nodeName);
        } else if (n.type === 'alertpublisher') {
          alertNodes.push(nodeName);
        } else if (n.type === 'errortransform') {
          errorNodes.push(nodeName);
        }
      });
      var sourceConns = connections.filter(function (conn) {
        if (nodesMap[conn.from].type === GLOBALS.pluginTypes[appType].source) {
          return conn;
        }
      });

      if (!sourceConns.length) {
        sourceConns = [findTransformThatIsSource(originalConnections)];
      }

      addConnectionsInOrder(sourceConns[0], finalConnections, originalConnections);

      if (finalConnections.length < originalConnections.length) {
        originalConnections.forEach(function (oConn) {
          var match = finalConnections.filter(function (fConn) {
            return fConn.from === oConn.from && fConn.to === oConn.to;
          }).length === 0;

          if (match) {
            parallelConnections.push(oConn);
          }
        });
        finalConnections = finalConnections.concat(parallelConnections);
      }

      orderConditionConnections(conditionNodes);
      orderAlertErrorConnections(errorNodes);
      orderAlertErrorConnections(alertNodes, false);
      return finalConnections.map(function (conn) {
        delete conn.visited;
        return conn;
      });
    }

    function pruneNonBackEndProperties(config) {
      function propertiesIterator(properties, backendProperties) {
        if (backendProperties) {
          angular.forEach(properties, function (value, key) {
            // If its a required field don't remove it.
            // This is specifically for Stream Grok pattern. If the user specifies format as "grok" in Stream we need to set this property in stream. It is not sent as list of properties from backend for that plugin.
            var isRequiredField = backendProperties[key] && backendProperties[key].required;
            var isKeyFormatSetting = key === 'format.setting.pattern';
            var isPropertyEmptyOrNull = properties[key] === '' || properties[key] === null;
            var isErrorDatasetName = !backendProperties[key] && key !== 'errorDatasetName';
            var isWorkspaceID = !backendProperties[key] && key === 'workspaceId';

            if (isKeyFormatSetting && !isPropertyEmptyOrNull || isWorkspaceID) {
              return;
            }

            if (isErrorDatasetName || !isRequiredField && isPropertyEmptyOrNull) {
              delete properties[key];
            }
          });
        } // FIXME: Remove this once https://issues.cask.co/browse/CDAP-3614 is fixed.
        // FIXME: This should be removed. At any point in time we need the backend properties
        // to find if a predefined app or imported config to assess if a property needs some modification.


        angular.forEach(properties, function (value, key) {
          var isPropertyEmptyOrNull = properties[key] === '' || properties[key] === null;

          if (isPropertyEmptyOrNull) {
            delete properties[key];
          }
        });
        return properties;
      }

      if (angular.isArray(config.stages)) {
        config.stages.forEach(function (node) {
          if (angular.isObject(myHelpers.objectQuery(node, 'plugin', 'properties')) && Object.keys(node.plugin.properties).length > 0) {
            node.plugin.properties = propertiesIterator(node.plugin.properties, node.plugin._backendProperties);
          }
        });
      }
    }

    function pruneProperties(config) {
      pruneNonBackEndProperties(config);

      if (angular.isArray(config.stages)) {
        config.stages.forEach(function (node) {
          delete node.plugin._backendProperties;
        });
      }

      return config;
    }

    return {
      orderConnections: orderConnections,
      pruneProperties: pruneProperties
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
  /* /services/hydrator-node-service.js */

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
  var HydratorPlusPlusNodeService = /*#__PURE__*/function () {
    HydratorPlusPlusNodeService.$inject = ["$q", "HydratorPlusPlusHydratorService", "IMPLICIT_SCHEMA", "myHelpers", "GLOBALS", "avsc", "$state", "myPipelineApi"];
    function HydratorPlusPlusNodeService($q, HydratorPlusPlusHydratorService, IMPLICIT_SCHEMA, myHelpers, GLOBALS, avsc, $state, myPipelineApi) {
      'ngInject';

      _classCallCheck(this, HydratorPlusPlusNodeService);

      this.$q = $q;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.myHelpers = myHelpers;
      this.IMPLICIT_SCHEMA = IMPLICIT_SCHEMA;
      this.GLOBALS = GLOBALS;
      this.avsc = avsc;
      this.$state = $state;
      this.myPipelineApi = myPipelineApi;
    }

    _createClass(HydratorPlusPlusNodeService, [{
      key: "getPluginInfo",
      value: function getPluginInfo(node, appType, sourceConnections, sourceNodes, artifactVersion) {
        var _this = this;

        var promise;

        if (angular.isObject(node._backendProperties) && Object.keys(node._backendProperties).length) {
          promise = this.$q.when(node);
        } else {
          promise = this.HydratorPlusPlusHydratorService.fetchBackendProperties(node, appType, artifactVersion);
        }

        return promise.then(function (node) {
          return _this.configurePluginInfo(node, sourceConnections, sourceNodes);
        });
      }
    }, {
      key: "isFieldExistsInSchema",
      value: function isFieldExistsInSchema(field, schema) {
        if (angular.isObject(schema) && Array.isArray(schema.fields)) {
          return schema.fields.filter(function (schemaField) {
            return schemaField.name === field.name;
          }).length;
        }

        return false;
      }
    }, {
      key: "parseSchema",
      value: function parseSchema(schema) {
        var rSchema;

        if (typeof schema === 'string') {
          if (this.HydratorPlusPlusHydratorService.containsMacro(schema)) {
            return schema;
          }

          try {
            rSchema = JSON.parse(schema);
          } catch (e) {
            rSchema = null;
          }
        } else {
          rSchema = schema;
        }

        return rSchema;
      }
    }, {
      key: "getInputSchema",
      value: function getInputSchema(sourceNode, currentNode, sourceConnections) {
        var _this2 = this;

        if (!sourceNode.outputSchema || typeof sourceNode.outputSchema === 'string') {
          sourceNode.outputSchema = [this.getOutputSchemaObj(sourceNode.outputSchema)];
        }

        var schema = sourceNode.outputSchema[0].schema;
        var defer = this.$q.defer(); // If the current stage is an error collector and the previous stage is a source
        // Then call validation API to get error schema of previous node and set it as input schema
        // of the current stage.

        if (currentNode.type === 'errortransform' && (sourceNode.type === 'batchsource' || sourceNode.type === 'streamingsource')) {
          var body = {
            stage: {
              name: sourceNode.name,
              plugin: sourceNode.plugin
            }
          };
          var params = {
            context: this.$state.params.namespace
          };
          this.myPipelineApi.validateStage(params, body).$promise.then(function (res) {
            var schema = _this2.myHelpers.objectQuery(res, 'spec', 'errorSchema') || _this2.myHelpers.objectQuery(res, 'spec', 'outputSchema');

            defer.resolve(_this2.parseSchema(schema));
          });
          return defer.promise;
        } // If for nodes other than source set the input schema of previous stage as input
        // schema of the current stage.


        if (currentNode.type === 'errortransform' && sourceNode.type !== 'batchsource') {
          schema = sourceNode.inputSchema && Array.isArray(sourceNode.inputSchema) ? sourceNode.inputSchema[0].schema : sourceNode.inputSchema;
        } // If current stage connects to a port from previous stage then cycle through connections
        // and find the stage and its output schema. That is the input schema for current stage.


        if (sourceNode.outputSchema[0].name !== this.GLOBALS.defaultSchemaName) {
          var sourcePort = (sourceConnections.find(function (sconn) {
            return sconn.port;
          }) || {}).port;
          var sourceSchema = sourceNode.outputSchema.filter(function (outputSchema) {
            return outputSchema.name === sourcePort;
          });
          schema = sourceSchema[0].schema;
        }

        if (Object.keys(this.IMPLICIT_SCHEMA).indexOf(sourceNode.plugin.properties.format) !== -1) {
          schema = this.IMPLICIT_SCHEMA[sourceNode.plugin.properties.format];
        }

        defer.resolve(this.parseSchema(schema));
        return defer.promise;
      }
    }, {
      key: "configurePluginInfo",
      value: function configurePluginInfo(node, sourceConnections, sourceNodes) {
        var _this3 = this;

        var defer = this.$q.defer();

        if (['action', 'source'].indexOf(this.GLOBALS.pluginConvert[node.type]) !== -1) {
          defer.resolve(node);
          return defer.promise;
        }

        var inputSchemas = [];
        var allInputSchemas = sourceNodes.map(function (sourceNode) {
          return _this3.getInputSchema(sourceNode, node, sourceConnections).then(function (inputSchema) {
            var schemaContainsMacro = typeof inputSchema === 'string' && _this3.HydratorPlusPlusHydratorService.containsMacro(inputSchema);

            inputSchemas.push({
              name: sourceNode.plugin.label,
              schema: schemaContainsMacro ? inputSchema : _this3.HydratorPlusPlusHydratorService.formatSchemaToAvro(inputSchema)
            });
          });
        });
        this.$q.all(allInputSchemas).then(function () {
          node.inputSchema = inputSchemas;
          return defer.resolve(node);
        });
        return defer.promise;
      }
    }, {
      key: "getOutputSchemaObj",
      value: function getOutputSchemaObj(schema) {
        var schemaObjName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.GLOBALS.defaultSchemaName;
        return {
          name: schemaObjName,
          schema: schema
        };
      }
    }, {
      key: "getSchemaObj",
      value: function getSchemaObj() {
        var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.GLOBALS.defaultSchemaName;
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'record';
        return {
          type: type,
          name: name,
          fields: fields
        };
      }
    }, {
      key: "shouldPropagateSchemaToNode",
      value: function shouldPropagateSchemaToNode(targetNode) {
        if (targetNode.implicitSchema || targetNode.type === 'batchjoiner' || targetNode.type === 'splittertransform') {
          return false;
        } // If we encounter a macro schema, stop propagataion


        var schema = targetNode.outputSchema;

        try {
          if (Array.isArray(schema)) {
            if (!_.isEmpty(schema[0].schema)) {
              this.avsc.parse(schema[0].schema, {
                wrapUnions: true
              });
            }
          } else if (typeof schema === 'string') {
            this.avsc.parse(schema, {
              wrapUnions: true
            });
          }
        } catch (e) {
          return false;
        }

        return true;
      }
    }, {
      key: "getPluginToArtifactMap",
      value: function getPluginToArtifactMap() {
        var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var typeMap = {};
        plugins.forEach(function (plugin) {
          typeMap[plugin.name] = typeMap[plugin.name] || [];
          typeMap[plugin.name].push(plugin);
        });
        return typeMap;
      }
    }, {
      key: "getDefaultVersionForPlugin",
      value: function getDefaultVersionForPlugin() {
        var plugin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var defaultVersionMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!Object.keys(plugin).length) {
          return {};
        }

        var defaultVersionsList = Object.keys(defaultVersionMap);
        var key = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name);
        var isDefaultVersionExists = defaultVersionsList.indexOf(key) !== -1;
        var isArtifactExistsInBackend = (plugin.allArtifacts || []).filter(function (plug) {
          return angular.equals(plug.artifact, defaultVersionMap[key]);
        });

        if (!isDefaultVersionExists || !isArtifactExistsInBackend.length) {
          var highestVersion = window.CaskCommon.VersionUtilities.findHighestVersion(plugin.allArtifacts.map(function (plugin) {
            return plugin.artifact.version;
          }), true);
          var latestPluginVersion = plugin.allArtifacts.find(function (plugin) {
            return plugin.artifact.version === highestVersion;
          });
          return this.myHelpers.objectQuery(latestPluginVersion, 'artifact');
        }

        return angular.copy(defaultVersionMap[key]);
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusNodeService;
  }();

  angular.module(PKG.name + '.feature.hydrator').service('HydratorPlusPlusNodeService', HydratorPlusPlusNodeService);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/hydrator-plus-ordering-factory.js */

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
  HydratorPlusPlusOrderingFactory.$inject = ["GLOBALS"];
  function HydratorPlusPlusOrderingFactory(GLOBALS) {
    function getArtifactDisplayName(artifactName) {
      return GLOBALS.artifactConvert[artifactName] || artifactName;
    }

    function getPluginTypeDisplayName(pluginType) {
      return GLOBALS.pluginTypeToLabel[pluginType] || pluginType;
    }

    function orderPluginTypes(pluginsMap) {
      if (!pluginsMap.length) {
        return pluginsMap;
      }

      var orderedTypes = [];
      var action = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['action'];
      });
      var source = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['source'];
      });
      var transform = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['transform'];
      });
      var sink = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['sink'];
      });
      var analytics = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['analytics'];
      });
      var errorHandlers = pluginsMap.filter(function (p) {
        return p.name === GLOBALS.pluginLabels['erroralert'];
      });

      if (source.length) {
        orderedTypes.push(source[0]);
      }

      if (transform.length) {
        orderedTypes.push(transform[0]);
      }

      if (analytics.length) {
        orderedTypes.push(analytics[0]);
      }

      if (sink.length) {
        orderedTypes.push(sink[0]);
      }

      if (action.length) {
        orderedTypes.push(action[0]);
      }

      if (errorHandlers.length) {
        orderedTypes.push(errorHandlers[0]);
      } // Doing this so that the SidePanel does not lose the reference of the original
      // array object.


      angular.forEach(orderedTypes, function (type, index) {
        pluginsMap[index] = type;
      });
      return pluginsMap;
    }

    function getAdjacencyMap(connections) {
      var adjacencyMap = {};

      if (!Array.isArray(connections)) {
        return adjacencyMap;
      }

      connections.forEach(function (conn) {
        if (Array.isArray(adjacencyMap[conn.from])) {
          adjacencyMap[conn.from].push(conn.to);
        } else {
          adjacencyMap[conn.from] = [conn.to];
        }
      });
      return adjacencyMap;
    }

    return {
      getArtifactDisplayName: getArtifactDisplayName,
      getPluginTypeDisplayName: getPluginTypeDisplayName,
      orderPluginTypes: orderPluginTypes,
      getAdjacencyMap: getAdjacencyMap
    };
  }

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusOrderingFactory', HydratorPlusPlusOrderingFactory);
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
  /* /services/hydrator-service.js */

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
  var HydratorPlusPlusHydratorService = /*#__PURE__*/function () {
    HydratorPlusPlusHydratorService.$inject = ["GLOBALS", "DAGPlusPlusFactory", "uuid", "$state", "$rootScope", "myPipelineApi", "$q", "IMPLICIT_SCHEMA", "DAGPlusPlusNodesStore", "myHelpers"];
    function HydratorPlusPlusHydratorService(GLOBALS, DAGPlusPlusFactory, uuid, $state, $rootScope, myPipelineApi, $q, IMPLICIT_SCHEMA, DAGPlusPlusNodesStore, myHelpers) {
      _classCallCheck(this, HydratorPlusPlusHydratorService);

      this.GLOBALS = GLOBALS;
      this.DAGPlusPlusFactory = DAGPlusPlusFactory;
      this.uuid = uuid;
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.myPipelineApi = myPipelineApi;
      this.$q = $q;
      this.IMPLICIT_SCHEMA = IMPLICIT_SCHEMA;
      this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
      this.myHelpers = myHelpers;
    }

    _createClass(HydratorPlusPlusHydratorService, [{
      key: "getNodesAndConnectionsFromConfig",
      value: function getNodesAndConnectionsFromConfig(pipeline, isStudio) {
        if (pipeline.config && pipeline.config.stages) {
          return this._parseNewConfigStages(pipeline.config, isStudio);
        } else {
          return this._parseOldConfig(pipeline, isStudio);
        }
      }
    }, {
      key: "getNodesFromStages",
      value: function getNodesFromStages(stages) {
        var _this = this;

        var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
        var nodes = stages.map(function (stage) {
          var nodeInfo = angular.extend(stage, {
            type: stage.plugin.type,
            label: stage.plugin.label,
            icon: _this.DAGPlusPlusFactory.getIcon(stage.plugin.name),
            id: sanitize(stage.id) || "".concat(sanitize(stage.name)).concat(_this.uuid.v4())
          });
          return nodeInfo;
        });
        return nodes;
      }
    }, {
      key: "getNodesMap",
      value: function getNodesMap(nodes) {
        var nodesMap = {};
        nodes.forEach(function (node) {
          return nodesMap[node.name] = node;
        });
        return nodesMap;
      }
    }, {
      key: "_parseNewConfigStages",
      value: function _parseNewConfigStages(config, isStudio) {
        var _this2 = this;

        var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
        var nodes = [];
        var connections = [];
        config.stages.forEach(function (node) {
          var nodeInfo = angular.extend(node, {
            type: node.plugin.type,
            label: node.plugin.label,
            icon: _this2.DAGPlusPlusFactory.getIcon(node.plugin.name),
            id: sanitize(node.id)
          });
          nodes.push(nodeInfo);
        });
        connections = config.connections; // Obtaining layout of graph with Dagre

        var graph;

        if (isStudio) {
          graph = this.DAGPlusPlusFactory.getGraphLayout(nodes, connections, 200);
        } else {
          graph = this.DAGPlusPlusFactory.getGraphLayout(nodes, connections);
        }

        angular.forEach(nodes, function (node) {
          node._uiPosition = {
            'top': graph._nodes[node.name].y + 'px',
            'left': graph._nodes[node.name].x + 'px'
          };
        });
        return {
          nodes: nodes,
          connections: connections,
          comments: config.comments || []
        };
      }
    }, {
      key: "_parseOldConfig",
      value: function _parseOldConfig(pipeline, isStudio) {
        var _this3 = this;

        var nodes = [];
        var connections = [];
        var config = pipeline.config;
        var artifact = this.GLOBALS.pluginTypes[pipeline.artifact.name];
        var source = angular.copy(config.source);
        var transforms = angular.copy(config.transforms || []).map(function (node) {
          node.type = artifact.transform;
          node.label = node.label || node.name;
          node.icon = _this3.DAGPlusPlusFactory.getIcon(node.plugin.name);
          return node;
        });
        var sinks = angular.copy(config.sinks).map(function (node) {
          node.type = artifact.sink;
          node.icon = _this3.DAGPlusPlusFactory.getIcon(node.plugin.name);
          return node;
        });

        if (Object.keys(source).length > 0) {
          source.type = artifact.source;
          source.icon = this.DAGPlusPlusFactory.getIcon(source.plugin.name); // replace with backend id

          nodes.push(source);
        }

        nodes = nodes.concat(transforms);
        nodes = nodes.concat(sinks);
        connections = config.connections; // Obtaining layout of graph with Dagre

        var graph;

        if (isStudio) {
          graph = this.DAGPlusPlusFactory.getGraphLayout(nodes, connections, 200);
        } else {
          graph = this.DAGPlusPlusFactory.getGraphLayout(nodes, connections);
        }

        angular.forEach(nodes, function (node) {
          node._uiPosition = {
            'top': graph._nodes[node.name].y + 'px',
            'left': graph._nodes[node.name].x + 'px'
          };
        });
        return {
          nodes: nodes,
          connections: connections
        };
      }
    }, {
      key: "fetchBackendProperties",
      value: function fetchBackendProperties(node, appType, artifactVersion) {
        var defer = this.$q.defer(); // This needs to pass on a scope always. Right now there is no cleanup
        // happening

        var params = {
          namespace: this.$state.params.namespace,
          pipelineType: appType,
          version: artifactVersion || this.$rootScope.cdapVersion,
          extensionType: node.type || node.plugin.type,
          pluginName: node.plugin.name,
          artifactVersion: node.plugin.artifact.version,
          artifactName: node.plugin.artifact.name,
          artifactScope: node.plugin.artifact.scope,
          limit: 1,
          order: 'DESC'
        };
        return this.myPipelineApi.fetchPluginProperties(params).$promise.then(function () {
          var res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          // Since now we have added plugin artifact information to be passed in query params
          // We don't get a list (or list of different versions of the plugin) anymore. Its always a list of 1 item.
          // Overwriting artifact as UI could have artifact ranges while importing draft.
          var lastElementIndex = res.length - 1;
          node._backendProperties = res[lastElementIndex].properties || {};
          node.description = res[lastElementIndex].description;
          node.plugin.artifact = res[lastElementIndex].artifact;
          defer.resolve(node);
          return defer.promise;
        });
      }
    }, {
      key: "formatSchema",
      value: function formatSchema(node) {
        var schema;
        var input;
        var jsonSchema;
        jsonSchema = node.outputSchema;

        try {
          input = JSON.parse(jsonSchema);
        } catch (e) {
          input = null;
        }

        schema = input ? input.fields : null;
        angular.forEach(schema, function (field) {
          if (angular.isArray(field.type)) {
            field.type = field.type[0];
            field.nullable = true;
          } else {
            field.nullable = false;
          }
        });
        return schema;
      }
    }, {
      key: "formatOutputSchema",
      value: function formatOutputSchema(schemaArray) {
        var typeMap = 'map<string, string>';
        var mapObj = {
          type: 'map',
          keys: 'string',
          values: 'string'
        };
        var properties = [];
        angular.forEach(schemaArray, function (p) {
          if (p.name) {
            var property;

            if (p.type === typeMap) {
              property = angular.copy(mapObj);
            } else {
              property = p.type;
            }

            properties.push({
              name: p.name,
              type: p.nullable ? [property, 'null'] : property
            });
          }
        }); // do not include properties on the request when schema field is empty

        if (properties.length !== 0) {
          var schema = {
            type: 'record',
            name: this.GLOBALS.defaultSchemaName,
            fields: properties
          }; // turn schema into JSON string

          var json = JSON.stringify(schema);
          return json;
        } else {
          return null;
        }
      }
    }, {
      key: "formatSchemaToAvro",
      value: function formatSchemaToAvro(schema) {
        var typeMap = 'map<string, string>';
        var mapObj = {
          type: 'map',
          keys: 'string',
          values: 'string'
        };
        var fields = [];
        var outputSchema;

        if (typeof schema === 'string') {
          try {
            outputSchema = JSON.parse(schema);
          } catch (e) {
            console.log('ERROR: Parsing schema JSON ', e);
            return schema;
          }
        } else if (schema === null || typeof schema === 'undefined') {
          return '';
        } else {
          outputSchema = angular.copy(schema);
        }

        if (outputSchema.name && outputSchema.type && outputSchema.fields) {
          return JSON.stringify(outputSchema);
        }

        fields = Object.keys(outputSchema).map(function (field) {
          if (outputSchema[field] === typeMap) {
            return {
              name: field,
              type: mapObj
            };
          }

          return {
            name: field,
            type: outputSchema[field]
          };
        });
        return JSON.stringify({
          name: outputSchema.name || this.GLOBALS.defaultSchemaName,
          type: outputSchema.type || 'record',
          fields: outputSchema.fields || fields
        });
      }
    }, {
      key: "getPrefsRelevantToMacros",
      value: function getPrefsRelevantToMacros() {
        var resolvedPrefs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var macrosMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        try {
          resolvedPrefs = JSON.parse(angular.toJson(resolvedPrefs));
        } catch (e) {
          console.log('ERROR: ', e);
          resolvedPrefs = {};
        }

        var relevantPrefs = {};

        for (var pref in resolvedPrefs) {
          if (macrosMap.hasOwnProperty(pref)) {
            relevantPrefs[pref] = resolvedPrefs[pref];
          }
        }

        return relevantPrefs;
      }
    }, {
      key: "isVersionInRange",
      value: function isVersionInRange() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            supportedVersion = _ref.supportedVersion,
            versionRange = _ref.versionRange;

        var flattenedVersion = versionRange;

        var isNil = function isNil(value) {
          return _.isUndefined(value) && _.isNull(value);
        };

        if (isNil(supportedVersion) || isNil(versionRange)) {
          return false;
        }

        if (['[', '('].indexOf(versionRange[0]) !== -1) {
          var supportedVersionInst = new window.CaskCommon.Version(supportedVersion);
          var entityVersionRangeInst = new window.CaskCommon.VersionRange(versionRange);

          if (entityVersionRangeInst.versionIsInRange(supportedVersionInst)) {
            return true;
          } else {
            return false;
          }
        }

        if (supportedVersion !== versionRange) {
          return false;
        }

        return flattenedVersion;
      }
    }, {
      key: "convertMapToKeyValuePairs",
      value: function convertMapToKeyValuePairs(obj) {
        var _this4 = this;

        var keyValuePairs = [];
        keyValuePairs = Object.keys(obj).map(function (objKey) {
          return {
            key: objKey,
            value: obj[objKey],
            uniqueId: 'id-' + _this4.uuid.v4()
          };
        });
        return keyValuePairs;
      }
    }, {
      key: "convertKeyValuePairsToMap",
      value: function convertKeyValuePairsToMap(keyValues) {
        var map = {};

        if (keyValues.pairs) {
          keyValues.pairs.forEach(function (currentPair) {
            if (currentPair.key.length > 0 && currentPair.key.length > 0) {
              var key = currentPair.key;
              map[key] = currentPair.value;
            }
          });
        }

        return map;
      }
    }, {
      key: "keyValuePairsHaveMissingValues",
      value: function keyValuePairsHaveMissingValues(keyValues) {
        if (keyValues.pairs) {
          return keyValues.pairs.some(function (keyValuePair) {
            if (keyValuePair.notDeletable && keyValuePair.provided) {
              return false;
            }

            var emptyKeyField = keyValuePair.key.length === 0;
            var emptyValueField = keyValuePair.value.length === 0; // buttons are disabled when either the key or the value of a pair is empty, but not both

            return emptyKeyField && !emptyValueField || !emptyKeyField && emptyValueField;
          });
        }

        return false;
      }
    }, {
      key: "getRuntimeArgsForDisplay",
      value: function getRuntimeArgsForDisplay(currentRuntimeArgs, macrosMap, userRuntimeArgumentsMap) {
        var _this5 = this;

        var runtimeArguments = {};
        var providedMacros = {}; // holds provided macros in an object here even though we don't need the value,
        // because object hash is faster than Array.indexOf

        if (currentRuntimeArgs.pairs) {
          currentRuntimeArgs.pairs.forEach(function (currentPair) {
            var key = currentPair.key;

            if (currentPair.notDeletable && currentPair.provided) {
              providedMacros[key] = currentPair.value;
            }
          });
        }

        var macros = Object.keys(macrosMap).map(function (macroKey) {
          var provided = false;

          if (providedMacros.hasOwnProperty(macroKey)) {
            provided = true;
          }

          return {
            key: macroKey,
            value: macrosMap[macroKey],
            uniqueId: 'id-' + _this5.uuid.v4(),
            notDeletable: true,
            provided: provided
          };
        });
        var userRuntimeArguments = this.convertMapToKeyValuePairs(userRuntimeArgumentsMap);
        runtimeArguments.pairs = macros.concat(userRuntimeArguments);
        return runtimeArguments;
      }
    }, {
      key: "convertRuntimeArgsToMacros",
      value: function convertRuntimeArgsToMacros(runtimeArguments) {
        var macrosMap = {};
        var userRuntimeArgumentsMap = {};
        runtimeArguments.pairs.forEach(function (currentPair) {
          var key = currentPair.key;

          if (currentPair.notDeletable) {
            macrosMap[key] = currentPair.value;
          } else {
            userRuntimeArgumentsMap[key] = currentPair.value;
          }
        });
        return {
          macrosMap: macrosMap,
          userRuntimeArgumentsMap: userRuntimeArgumentsMap
        };
      }
    }, {
      key: "getMacrosWithNonEmptyValues",
      value: function getMacrosWithNonEmptyValues(macrosMap) {
        var macrosMapCopy = Object.assign({}, macrosMap);

        var _this$myHelpers$objHa = this.myHelpers.objHasMissingValues(macrosMapCopy),
            keysWithMissingValue = _this$myHelpers$objHa.keysWithMissingValue;

        keysWithMissingValue.forEach(function (key) {
          delete macrosMapCopy[key];
        });
        return macrosMapCopy;
      }
    }, {
      key: "runtimeArgsContainsMacros",
      value: function runtimeArgsContainsMacros(runtimeArgs) {
        return runtimeArgs.pairs.some(function (currentPair) {
          return currentPair.notDeletable;
        });
      }
    }, {
      key: "containsMacro",
      value: function containsMacro(value) {
        if (!value) {
          return false;
        }

        var beginIndex = value.indexOf('${');
        var endIndex = value.indexOf('}');

        if (beginIndex === -1 || endIndex === -1 || beginIndex > endIndex) {
          return false;
        }

        return true;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusHydratorService;
  }();

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusHydratorService', HydratorPlusPlusHydratorService);
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
  /* /services/hydrator-upgrade-service.js */

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
  var HydratorUpgradeService = /*#__PURE__*/function () {
    HydratorUpgradeService.$inject = ["$rootScope", "myPipelineApi", "$state", "$uibModal", "HydratorPlusPlusConfigStore", "HydratorPlusPlusLeftPanelStore", "$q", "PipelineAvailablePluginsActions", "myAlertOnValium", "NonStorePipelineErrorFactory"];
    function HydratorUpgradeService($rootScope, myPipelineApi, $state, $uibModal, HydratorPlusPlusConfigStore, HydratorPlusPlusLeftPanelStore, $q, PipelineAvailablePluginsActions, myAlertOnValium, NonStorePipelineErrorFactory) {
      _classCallCheck(this, HydratorUpgradeService);

      this.$rootScope = $rootScope;
      this.myPipelineApi = myPipelineApi;
      this.$state = $state;
      this.$uibModal = $uibModal;
      this.HydratorPlusPlusConfigStore = HydratorPlusPlusConfigStore;
      this.leftPanelStore = HydratorPlusPlusLeftPanelStore;
      this.$q = $q;
      this.PipelineAvailablePluginsActions = PipelineAvailablePluginsActions;
      this.myAlertOnValium = myAlertOnValium;
      this.NonStorePipelineErrorFactory = NonStorePipelineErrorFactory;
    }

    _createClass(HydratorUpgradeService, [{
      key: "_checkVersionIsInRange",
      value: function _checkVersionIsInRange(range, version) {
        if (!range || !version) {
          return false;
        }

        if (['[', '('].indexOf(range[0]) !== -1) {
          var supportedVersion = new window.CaskCommon.Version(version);
          var versionRange = new window.CaskCommon.VersionRange(range);
          return versionRange.versionIsInRange(supportedVersion);
        } // Check equality if range is just a single version


        return range === version;
      }
    }, {
      key: "checkPipelineArtifactVersion",
      value: function checkPipelineArtifactVersion(config) {
        if (!config || !config.artifact) {
          return false;
        }

        var cdapVersion = this.$rootScope.cdapVersion;
        return this._checkVersionIsInRange(config.artifact.version, cdapVersion);
      }
    }, {
      key: "_fetchPostRunActions",
      value: function _fetchPostRunActions() {
        var params = {
          namespace: this.$state.params.namespace,
          pipelineType: 'cdap-data-pipeline',
          version: this.$rootScope.cdapVersion,
          extensionType: 'postaction'
        };
        return this.myPipelineApi.fetchPlugins(params);
      }
      /**
       * Create plugin artifacts map based on left panel store.
       * The key will be '<plugin name>-<plugin type>-<artifact name>'
       * Each map will contain an array of all the artifacts and
       * also information about highest version.
       * If there exist 2 artifacts with same version, it will maintain both scopes in an array.
       **/

    }, {
      key: "_createPluginsMap",
      value: function _createPluginsMap(pipelineConfig) {
        var _this = this;

        var deferred = this.$q.defer();
        var activePipelineType = this.HydratorPlusPlusConfigStore.getState().artifact.name;

        if (pipelineConfig.artifact.name !== activePipelineType) {
          this.PipelineAvailablePluginsActions.fetchPluginsForUpgrade({
            namespace: this.$state.params.namespace,
            pipelineType: pipelineConfig.artifact.name,
            version: this.$rootScope.cdapVersion
          }).then(function (res) {
            var plugins = res;

            _this._formatPluginsMap(plugins, pipelineConfig, deferred);
          });
        } else {
          var plugins = this.leftPanelStore.getState().plugins.pluginTypes; // If this is empty that means we haven't finished fetching all the plugins yet,
          // so needs to subscribe to the store

          if (_.isEmpty(plugins)) {
            this.leftPanelStoreSub = this.leftPanelStore.subscribe(function () {
              plugins = _this.leftPanelStore.getState().plugins.pluginTypes;

              if (!_.isEmpty(plugins)) {
                _this.leftPanelStoreSub();

                _this._formatPluginsMap(plugins, pipelineConfig, deferred);
              }
            });
          } else {
            this._formatPluginsMap(plugins, pipelineConfig, deferred);
          }
        }

        return deferred.promise;
      }
    }, {
      key: "_formatPluginsMap",
      value: function _formatPluginsMap(plugins, pipelineConfig, promise) {
        var pluginTypes = Object.keys(plugins);
        var pluginsMap = {};
        pluginTypes.forEach(function (type) {
          plugins[type].forEach(function (plugin) {
            var key = "".concat(plugin.name, "-").concat(type, "-").concat(plugin.artifact.name);
            var allArtifacts = plugin.allArtifacts.map(function (artifactInfo) {
              return artifactInfo.artifact;
            });
            var highestVersion;
            var artifactVersionMap = {};
            allArtifacts.forEach(function (artifact) {
              if (!highestVersion) {
                highestVersion = angular.copy(artifact);
              } else if (highestVersion.version === artifact.version) {
                highestVersion.scope = [highestVersion.scope, artifact.scope];
              } else {
                var prevVersion = new window.CaskCommon.Version(highestVersion.version);
                var currVersion = new window.CaskCommon.Version(artifact.version);

                if (currVersion.compareTo(prevVersion) === 1) {
                  highestVersion = angular.copy(artifact);
                }
              }
            });
            var value = {
              allArtifacts: allArtifacts,
              highestVersion: highestVersion,
              artifactVersionMap: artifactVersionMap
            };
            pluginsMap[key] = value;
          });
        });

        if (pipelineConfig.artifact.name === 'cdap-data-pipeline') {
          this._fetchPostRunActions().$promise.then(function (res) {
            var postRunActionsMap = {};
            res.forEach(function (plugin) {
              var postRunKey = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name);
              postRunActionsMap[postRunKey] = {
                allArtifacts: [plugin.artifact],
                highestVersion: plugin.artifact,
                artifactVersionMap: {}
              };
              postRunActionsMap[postRunKey].artifactVersionMap[plugin.artifact.version] = plugin.artifact.scope;
            });
            pluginsMap = Object.assign(pluginsMap, postRunActionsMap);
            promise.resolve(pluginsMap);
          });
        } else {
          promise.resolve(pluginsMap);
        }
      }
    }, {
      key: "_checkErrorStages",
      value: function _checkErrorStages(stages, pluginsMap) {
        var _this2 = this;

        var transformedStages = [];

        if (!stages || !stages.forEach) {
          // stages has been known to be missing in a pipeline json:
          // https://cdap.atlassian.net/browse/CDAP-17629
          // specifically this err was _checkErrorStages(postConfigActions, ...)
          return [];
        }

        stages.forEach(function (stage) {
          var stageKey = "".concat(stage.plugin.name, "-").concat(stage.plugin.type, "-").concat(stage.plugin.artifact.name);
          var stageArtifact = stage.plugin.artifact;
          var data = {
            stageInfo: stage,
            error: null
          };

          if (!pluginsMap[stageKey]) {
            data.error = 'NOTFOUND';
          } else if (!_this2._checkVersionIsInRange(stageArtifact.version, pluginsMap[stageKey].highestVersion.version)) {
            data.error = 'VERSION_MISMATCH';
            data.suggestion = pluginsMap[stageKey].highestVersion;

            if (typeof data.suggestion.scope !== 'string') {
              // defaulting to USER scope when both version exists
              data.suggestion.scope = 'USER';
            } // This is to check whether the version of the imported pipeline exist or not


            var existingVersion = pluginsMap[stageKey].artifactVersionMap[stageArtifact.version];

            if (existingVersion && existingVersion.indexOf(stageArtifact.scope) !== -1) {
              data.error = 'CAN_UPGRADE';
            }
          } else if (pluginsMap[stageKey].highestVersion.scope.indexOf(stageArtifact.scope) < 0) {
            data.error = 'SCOPE_MISMATCH';
            data.suggestion = pluginsMap[stageKey].highestVersion;
          }

          transformedStages.push(data);
        });
        return transformedStages;
      }
    }, {
      key: "getErrorStages",
      value: function getErrorStages(pipelineConfig) {
        var _this3 = this;

        var configStages = pipelineConfig.config.stages;
        var configPostActions = pipelineConfig.config.postActions;
        return this._createPluginsMap(pipelineConfig).then(function (pluginsMap) {
          var stages = _this3._checkErrorStages(configStages, pluginsMap);

          var postActions = _this3._checkErrorStages(configPostActions, pluginsMap);

          return {
            stages: stages,
            postActions: postActions
          };
        });
      }
    }, {
      key: "upgradePipelineArtifactVersion",
      value: function upgradePipelineArtifactVersion(pipelineConfig) {
        if (!pipelineConfig || !pipelineConfig.artifact) {
          return;
        }

        var cdapVersion = this.$rootScope.cdapVersion;

        var configClone = _.cloneDeep(pipelineConfig);

        configClone.artifact.version = cdapVersion;
        return configClone;
      }
    }, {
      key: "validateAndUpgradeConfigFile",
      value: function validateAndUpgradeConfigFile(configFile) {
        var _this4 = this;

        if (configFile.type !== 'application/json') {
          this.myAlertOnValium.show({
            type: 'danger',
            content: 'File should be in JSON format. Please upload a file with \'.json\' extension.'
          });
          return;
        }

        var reader = new FileReader();
        reader.readAsText(configFile, 'UTF-8');

        reader.onload = function (evt) {
          var fileDataString = evt.target.result;

          var isNotValid = _this4.NonStorePipelineErrorFactory.validateImportJSON(fileDataString);

          if (isNotValid) {
            _this4.myAlertOnValium.show({
              type: 'danger',
              content: isNotValid
            });

            return;
          }

          _this4.openUpgradeModal(fileDataString);
        };
      }
    }, {
      key: "openUpgradeModal",
      value: function openUpgradeModal(jsonData) {
        var isImport = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (typeof jsonData === 'string') {
          try {
            jsonData = JSON.parse(jsonData);
          } catch (e) {
            return;
          }
        }
        /**
         * This exists because we could easily have users import nodes with
         * name that has spaces and other special characters. Space and `/` are
         * not allowed as per html spec.
         *
         * We need the ids for adding context menus to plugin nodes.
         */


        var oldNameToNewNameMap = {};
        var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
        jsonData.config.stages = jsonData.config.stages.map(function (stage) {
          if (stage.name.indexOf(' ') !== -1 || stage.name.indexOf('/') !== -1) {
            oldNameToNewNameMap[stage.name] = sanitize(stage.name);
            return Object.assign({}, stage, {
              id: sanitize(stage.name)
            });
          }

          return Object.assign({}, stage, {
            id: stage.name
          });
        });
        this.$uibModal.open({
          templateUrl: '/assets/features/hydrator/templates/create/pipeline-upgrade-modal.html',
          size: 'lg',
          backdrop: 'static',
          keyboard: false,
          windowTopClass: 'hydrator-modal node-config-modal upgrade-modal',
          controllerAs: 'PipelineUpgradeController',
          controller: 'PipelineUpgradeModalController',
          resolve: {
            rPipelineConfig: function rPipelineConfig() {
              return jsonData;
            },
            rIsImport: function rIsImport() {
              return isImport;
            }
          }
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

    return HydratorUpgradeService;
  }();

  angular.module(PKG.name + '.feature.hydrator').service('HydratorUpgradeService', HydratorUpgradeService);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/non-store-pipeline-error-factory.js */

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
  angular.module("".concat(PKG.name, ".feature.hydrator")).factory('NonStorePipelineErrorFactory', function () {
    return window.CaskCommon.PipelineErrorFactory;
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
  /* /services/plugin-config-factory.js */

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
  var HydratorPlusPlusPluginConfigFactory = /*#__PURE__*/function () {
    HydratorPlusPlusPluginConfigFactory.$inject = ["$q", "myHelpers", "myPipelineApi", "$state", "myAlertOnValium", "HydratorPlusPlusNodeService"];
    function HydratorPlusPlusPluginConfigFactory($q, myHelpers, myPipelineApi, $state, myAlertOnValium, HydratorPlusPlusNodeService) {
      _classCallCheck(this, HydratorPlusPlusPluginConfigFactory);

      this.$q = $q;
      this.myHelpers = myHelpers;
      this.myPipelineApi = myPipelineApi;
      this.myAlertOnValium = myAlertOnValium;
      this.$state = $state;
      this.configurationGroupUtilities = window.CaskCommon.ConfigurationGroupUtilities;
      this.dynamicFiltersUtilities = window.CaskCommon.DynamicFiltersUtilities;
      this.data = {};
      this.validatePluginProperties = this.validatePluginProperties.bind(this);
      this.HydratorPlusPlusNodeService = HydratorPlusPlusNodeService;
      this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    }

    _createClass(HydratorPlusPlusPluginConfigFactory, [{
      key: "fetchWidgetJson",
      value: function fetchWidgetJson(artifactName, artifactVersion, artifactScope, key) {
        var _this = this;

        var cache = this.data["".concat(artifactName, "-").concat(artifactVersion, "-").concat(artifactScope, "-").concat(key)];

        if (cache) {
          return this.$q.when(cache);
        }

        return this.myPipelineApi.fetchArtifactProperties({
          namespace: this.$state.params.namespace || this.$state.params.nsadmin,
          artifactName: artifactName,
          artifactVersion: artifactVersion,
          scope: artifactScope,
          keys: key
        }).$promise.then(function (res) {
          try {
            var config = res[key];

            if (config) {
              config = JSON.parse(config);
              _this.data["".concat(artifactName, "-").concat(artifactVersion, "-").concat(key)] = config;
              return config;
            } else {
              throw 'NO_JSON_FOUND';
            }
          } catch (e) {
            throw e && e.name === 'SyntaxError' ? 'CONFIG_SYNTAX_JSON_ERROR' : e;
          }
        }, function () {
          throw 'NO_JSON_FOUND';
        });
      }
    }, {
      key: "fetchDocJson",
      value: function fetchDocJson(artifactName, artifactVersion, artifactScope, key) {
        return this.myPipelineApi.fetchArtifactProperties({
          namespace: this.$state.params.namespace,
          artifactName: artifactName,
          artifactVersion: artifactVersion,
          scope: artifactScope,
          keys: key
        }).$promise;
      }
    }, {
      key: "generateNodeConfig",
      value: function generateNodeConfig(backendProperties, nodeConfig) {
        var specVersion = this.myHelpers.objectQuery(nodeConfig, 'metadata', 'spec-version') || '0.0';

        switch (specVersion) {
          case '0.0':
            return this.generateConfigForOlderSpec(backendProperties, nodeConfig);

          case '1.0':
          case '1.1':
            return this.generateConfigForNewSpec(backendProperties, nodeConfig);

          case '1.2':
            return this.generateConfigFor12Spec(backendProperties, nodeConfig);

          case '1.3':
          case '1.4':
          case '1.5':
          case '1.6':
            return this.generateConfigFor13Spec(backendProperties, nodeConfig);

          default:
            // No spec version which means
            throw 'NO_JSON_FOUND';
        }
      }
    }, {
      key: "generateConfigFor13Spec",
      value: function generateConfigFor13Spec(backendProperties, nodeConfig) {
        var config = this.generateConfigFor12Spec(backendProperties, nodeConfig);
        config.jumpConfig = {};

        if (_typeof(nodeConfig['jump-config']) === 'object') {
          config.jumpConfig = nodeConfig['jump-config'];
        }

        return config;
      }
    }, {
      key: "generateConfigFor12Spec",
      value: function generateConfigFor12Spec(backendProperties, nodeConfig) {
        var config = this.generateConfigForNewSpec(backendProperties, nodeConfig);
        config.inputs = {};

        if (_typeof(nodeConfig.inputs) === 'object') {
          if (nodeConfig.inputs.multipleInputs) {
            config.inputs.multipleInputs = true;
          }
        }

        return config;
      }
    }, {
      key: "generateConfigForNewSpec",
      value: function generateConfigForNewSpec(backendProperties, nodeConfig) {
        var _this2 = this;

        var propertiesFromBackend = Object.keys(backendProperties);
        var groupsConfig = {
          backendProperties: propertiesFromBackend,
          outputSchema: {
            isOutputSchemaExists: false,
            schemaProperties: null,
            outputSchemaProperty: null,
            isOutputSchemaRequired: null,
            implicitSchema: null,
            watchProperty: null
          },
          groups: []
        };
        var missedFieldsGroup = {
          display: 'Generic',
          fields: []
        }; // Parse configuration groups

        nodeConfig['configuration-groups'].forEach(function (group) {
          var matchedProperties = group.properties.filter(function (property) {
            var index = propertiesFromBackend.indexOf(property.name);

            if (index !== -1) {
              propertiesFromBackend.splice(index, 1);
              var description = property.description;

              if (!description || description && !description.length) {
                description = _this2.myHelpers.objectQuery(backendProperties, property.name, 'description');
                property.description = description || 'No Description Available';
              }

              property.label = property.label || property.name;
              property.defaultValue = _this2.myHelpers.objectQuery(property, 'widget-attributes', 'default');
              return true;
            }

            return false;
          });
          groupsConfig.groups.push({
            display: group.label,
            description: group.description,
            fields: matchedProperties
          });
        }); // Parse 'outputs' and find the property that needs to be used as output schema.

        if (nodeConfig.outputs && nodeConfig.outputs.length) {
          nodeConfig.outputs.forEach(function (output) {
            var index;

            if (output['widget-type'] === 'non-editable-schema-editor') {
              groupsConfig.outputSchema.isOutputSchemaExists = true;
              groupsConfig.outputSchema.implicitSchema = output.schema;
            } else {
              index = propertiesFromBackend.indexOf(output.name);

              if (index !== -1) {
                propertiesFromBackend.splice(index, 1);
                groupsConfig.outputSchema.isOutputSchemaExists = true;
                groupsConfig.outputSchema.outputSchemaProperty = [output.name];
                groupsConfig.outputSchema.schemaProperties = output['widget-attributes'];
                groupsConfig.outputSchema.isOutputSchemaRequired = backendProperties[output.name].required;
              }
            }
          });
        } // Parse properties that are from backend but not from config json.


        if (propertiesFromBackend.length) {
          propertiesFromBackend.forEach(function (property) {
            missedFieldsGroup.fields.push({
              'widget-type': 'textbox',
              label: property,
              name: property,
              info: 'Info',
              description: _this2.myHelpers.objectQuery(backendProperties, property, 'description') || 'No Description Available'
            });
          });
          groupsConfig.groups.push(missedFieldsGroup);
        }

        return groupsConfig;
      }
    }, {
      key: "generateConfigForOlderSpec",
      value: function generateConfigForOlderSpec(backendProperties, nodeConfig) {
        var _this3 = this;

        var propertiesFromBackend = Object.keys(backendProperties);
        var groupConfig = {
          backendProperties: propertiesFromBackend,
          outputSchema: {
            isOutputSchemaExists: false,
            schemaProperties: null,
            outputSchemaProperty: null,
            isOutputSchemaRequired: null,
            implicitSchema: false
          },
          groups: []
        };
        var index;
        var schemaProperty; // Parse 'outputs' and find the property that needs to be used as output schema.

        if (nodeConfig.outputschema) {
          groupConfig.outputSchema.outputSchemaProperty = Object.keys(nodeConfig.outputschema);

          if (!nodeConfig.outputschema.implicit) {
            groupConfig.outputSchema.isOutputSchemaExists = propertiesFromBackend.indexOf(groupConfig.outputSchema.outputSchemaProperty[0]) !== -1;

            if (groupConfig.outputSchema.isOutputSchemaExists) {
              schemaProperty = groupConfig.outputSchema.outputSchemaProperty[0];
              index = propertiesFromBackend.indexOf(schemaProperty);
              groupConfig.outputSchema.schemaProperties = nodeConfig.outputschema[schemaProperty];
              groupConfig.outputSchema.isOutputSchemaRequired = backendProperties[schemaProperty].required;
              propertiesFromBackend.splice(index, 1);
            }
          } else if (nodeConfig.outputschema && nodeConfig.outputschema.implicit) {
            groupConfig.outputSchema.implicitSchema = nodeConfig.outputschema.implict;
            groupConfig.outputSchema.isOutputSchemaExists = true;
          }
        } else {
          groupConfig.outputSchema.isOutputSchemaExists = false;
        } // Parse configuration groups


        angular.forEach(nodeConfig.groups.position, function (groupName) {
          var group = nodeConfig.groups[groupName];
          var newGroup = {};
          newGroup.label = group.display;
          newGroup.fields = [];
          angular.forEach(group.position, function (fieldName) {
            var copyOfField = group.fields[fieldName];
            var index = propertiesFromBackend.indexOf(fieldName);

            if (index !== -1) {
              propertiesFromBackend.splice(index, 1);
              copyOfField.name = fieldName;
              copyOfField.info = _this3.myHelpers.objectQuery(groupConfig, 'groups', groupName, 'fields', fieldName, 'info') || 'Info'; // If there is a description in the config from nodejs use that otherwise fallback to description from backend.

              var description = _this3.myHelpers.objectQuery(nodeConfig, 'groups', groupName, 'fields', fieldName, 'description');

              if (!description || description && !description.length) {
                description = _this3.myHelpers.objectQuery('backendProperties', fieldName, 'description');
                copyOfField.description = description || 'No Description Available';
              }

              var label = _this3.myHelpers.objectQuery(nodeConfig, 'groups', groupName, 'fields', fieldName, 'label');

              if (!label) {
                copyOfField.label = fieldName;
              }

              copyOfField.defaultValue = _this3.myHelpers.objectQuery(nodeConfig, 'groups', groupName, 'fields', fieldName, 'properties', 'default');
            }

            newGroup.fields.push(copyOfField);
          });
          groupConfig.groups.push(newGroup);
        }); // After iterating over all the groups check if the propertiesFromBackend is still empty
        // If not there are some fields from backend for which we don't have configuration from the nodejs.
        // Add them to the 'missedFieldsGroup' and show it as a separate group.

        if (propertiesFromBackend.length) {
          var genericGroup = {
            label: 'Generic',
            fields: []
          };
          angular.forEach(propertiesFromBackend, function (property) {
            genericGroup.fields.push({
              widget: 'textbox',
              label: property,
              info: 'Info',
              description: _this3.myHelpers.objectQuery(backendProperties, property, 'description') || 'No Description Available'
            });
          });
          groupConfig.groups.push(genericGroup);
        }

        return groupConfig;
      }
    }, {
      key: "validatePluginProperties",
      value: function validatePluginProperties(nodeInfo, widgetJson, errorCb, validationFromGetSchema) {
        var _this4 = this;

        // for post-run plugins, use nodeInfo. For other plugins, get plugin property.
        var pluginInfo = nodeInfo.plugin ? nodeInfo.plugin : nodeInfo;
        var schemaProperty = this.myHelpers.objectQuery(widgetJson, 'outputs', 0, 'name');
        var plugin = angular.copy(pluginInfo);

        if (!plugin.type) {
          plugin.type = nodeInfo.type;
        }
        /**
         * TODO: CDAP-17535
         * - TL;DR - We need to remove the schema property when getting schema for the plugin.
         * - Longer version
         * The validation API does couple of things today,
         *  - Validates plugin properties (plugin specific logic)
         *  - Updates output schema if none provided
         *
         * 1. During validation it validates all the plugin properties (including input schema(s))
         * 2. If there is a schema it tries to validate the schema
         * 3. If the validation seemingly passes, it doesn't change the schema
         *
         * This results in unexpected behavior when user tries to use the 'Get Schema' button in the plugin
         * Since UI passes all the properties of the plugin, validation API does not update the output schema.
         *
         * So we remove the schema property to be able to update the schema from backend only for generating schema.
         * If the plugin doesn't generate a new schema UI won't update.
         *
         * While validating the plugin UI should not remove the schema property(existing behavior).
         */


        if (schemaProperty && validationFromGetSchema) {
          delete plugin.properties[schemaProperty];
        }

        var requestBody = {
          stage: {
            name: this.myHelpers.objectQuery(pluginInfo, 'name'),
            plugin: plugin
          },
          inputSchemas: !nodeInfo.inputSchema ? [] : nodeInfo.inputSchema.map(function (input) {
            var schema;

            try {
              schema = JSON.parse(input.schema);
            } catch (e) {// no-op
            }

            return {
              schema: schema,
              stage: input.name
            };
          })
        };

        if (validationFromGetSchema) {
          requestBody.resolveMacrosFromPreferences = true;
        }

        var parseResSchema = function parseResSchema(res) {
          if (res.name && res.type && res.fields) {
            return [_this4.HydratorPlusPlusNodeService.getOutputSchemaObj(res)];
          }

          var schemaArr = [];
          angular.forEach(res, function (value, key) {
            if (value.name && value.type && value.fields) {
              schemaArr.push(_this4.HydratorPlusPlusNodeService.getOutputSchemaObj(value, key));
            }
          });
          var recordSchemas = schemaArr.filter(function (schema) {
            return schema.name.substring(0, 6) === 'record';
          });

          var schemaArrWithoutRecordSchemas = _.difference(schemaArr, recordSchemas);

          var schemaArrWithSortedRecordSchemas = schemaArrWithoutRecordSchemas.concat(_.sortBy(recordSchemas, 'name'));
          return schemaArrWithSortedRecordSchemas;
        };

        var params = {
          context: this.$state.params.namespace || this.$state.params.nsadmin
        };
        this.myPipelineApi.validateStage(params, requestBody).$promise.then(function (res) {
          var errorCount;

          if (res.failures.length > 0) {
            var _this4$configurationG = _this4.configurationGroupUtilities.constructErrors(res.failures),
                propertyErrors = _this4$configurationG.propertyErrors,
                inputSchemaErrors = _this4$configurationG.inputSchemaErrors,
                outputSchemaErrors = _this4$configurationG.outputSchemaErrors;

            errorCount = _this4.configurationGroupUtilities.countErrors(propertyErrors, inputSchemaErrors, outputSchemaErrors);
            errorCb({
              errorCount: errorCount,
              propertyErrors: propertyErrors,
              inputSchemaErrors: inputSchemaErrors,
              outputSchemaErrors: outputSchemaErrors
            });
          } else {
            errorCount = 0;
            errorCb({
              errorCount: errorCount
            });

            var outputSchema = _this4.myHelpers.objectQuery(res, 'spec', 'outputSchema');

            var portSchemas = _this4.myHelpers.objectQuery(res, 'spec', 'portSchemas');

            var schemas;

            if (outputSchema || portSchemas) {
              schemas = parseResSchema(outputSchema || portSchemas).map(function (schema) {
                return {
                  name: schema.name,
                  schema: JSON.stringify(schema.schema)
                };
              });
            }

            if (schemas.length) {
              _this4.eventEmitter.emit('schema.import', schemas);
            } else if (!_this4.myHelpers.objectQuery(widgetJson, 'outputs', 0, 'name')) {
              _this4.eventEmitter.emit('schema.clear', schemas);
            }
          }
        }, function (err) {
          if (err && err.statusCode === 503) {
            /**
             * TODO: (CDAP-17468). We can do a better job in surfacing the 'orphanerrors'
             * in a better way. We currently are tightly coupled from here till configurationgroups
             * where we show the error.
             */
            var _propertyErrors = {
              'orphanErrors': [{
                msg: 'Unable to communicate with the Pipeline Studio service. Please check the service status.'
              }]
            };
            return errorCb({
              propertyErrors: _propertyErrors
            });
          }

          _this4.myAlertOnValium.show({
            type: 'danger',
            content: 'Error occurred while validating.'
          });

          var propertyErrors = {
            'orphanErrors': [{
              msg: err.data
            }]
          };
          errorCb({
            propertyErrors: propertyErrors
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

    return HydratorPlusPlusPluginConfigFactory;
  }();

  angular.module(PKG.name + '.feature.hydrator').service('HydratorPlusPlusPluginConfigFactory', HydratorPlusPlusPluginConfigFactory);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/query-helper.js */

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
  angular.module(PKG.name + '.feature.hydrator').factory('MyMetricsQueryHelper', function () {
    return window.CaskCommon.MetricsQueryHelper;
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/status-mapper.js */

  /*
   * Copyright © 2017-2018 Cask Data, Inc.
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
   * Maps a pipeline run status from the backend to display status on the frontend.
   */
  angular.module(PKG.name + '.feature.hydrator').factory('MyPipelineStatusMapper', function () {
    return window.CaskCommon.StatusMapper;
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
  /* /controllers/create/canvas-ctrl.js */

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
  var HydratorPlusPlusCreateCanvasCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusCreateCanvasCtrl.$inject = ["DAGPlusPlusNodesStore", "HydratorPlusPlusConfigStore", "HydratorPlusPlusHydratorService", "$uibModal", "GLOBALS", "DAGPlusPlusNodesActionsFactory", "HydratorPlusPlusPreviewStore", "$scope"];
    function HydratorPlusPlusCreateCanvasCtrl(DAGPlusPlusNodesStore, HydratorPlusPlusConfigStore, HydratorPlusPlusHydratorService, $uibModal, GLOBALS, DAGPlusPlusNodesActionsFactory, HydratorPlusPlusPreviewStore, $scope) {
      var _this = this;

      _classCallCheck(this, HydratorPlusPlusCreateCanvasCtrl);

      this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
      this.HydratorPlusPlusConfigStore = HydratorPlusPlusConfigStore;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.GLOBALS = GLOBALS;
      this.previewStore = HydratorPlusPlusPreviewStore;
      this.$uibModal = $uibModal;
      this.nodes = [];
      this.connections = [];
      this.previewMode = false;
      this.nodeConfigModalOpen = false;
      DAGPlusPlusNodesStore.registerOnChangeListener(function () {
        _this.setActiveNode();

        _this.setStateAndUpdateConfigStore();
      });
      var unsub = this.previewStore.subscribe(function () {
        var state = _this.previewStore.getState().preview;

        _this.previewMode = state.isPreviewModeEnabled;
      });
      $scope.$on('$destroy', function () {
        unsub();
      });
    }

    _createClass(HydratorPlusPlusCreateCanvasCtrl, [{
      key: "setStateAndUpdateConfigStore",
      value: function setStateAndUpdateConfigStore() {
        this.nodes = this.DAGPlusPlusNodesStore.getNodes();
        this.connections = this.DAGPlusPlusNodesStore.getConnections();
        this.HydratorPlusPlusConfigStore.setNodes(this.nodes);
        this.HydratorPlusPlusConfigStore.setConnections(this.connections);
      }
    }, {
      key: "setActiveNode",
      value: function setActiveNode() {
        var nodeId = this.DAGPlusPlusNodesStore.getActiveNodeId();

        if (!nodeId || this.nodeConfigModalOpen) {
          return;
        }

        var pluginNode;
        var nodeFromNodesStore;
        var nodeFromConfigStore = this.HydratorPlusPlusConfigStore.getNodes().filter(function (node) {
          return node.name === nodeId;
        });

        if (nodeFromConfigStore.length) {
          pluginNode = nodeFromConfigStore[0];
        } else {
          nodeFromNodesStore = this.DAGPlusPlusNodesStore.getNodes().filter(function (node) {
            return node.name === nodeId;
          });
          pluginNode = nodeFromNodesStore[0];
        }

        this.$uibModal.open({
          windowTemplateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/popover-template.html',
          templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/popover.html',
          size: 'lg',
          windowClass: 'node-config-modal hydrator-modal',
          controller: 'HydratorPlusPlusNodeConfigCtrl',
          bindToController: true,
          controllerAs: 'HydratorPlusPlusNodeConfigCtrl',
          animation: false,
          backdrop: 'static',
          resolve: {
            rIsStudioMode: function rIsStudioMode() {
              return true;
            },
            rNodeMetricsContext: function rNodeMetricsContext() {
              return false;
            },
            rDisabled: function rDisabled() {
              return false;
            },
            rPlugin: ['HydratorPlusPlusConfigStore', function (HydratorPlusPlusConfigStore) {
              var pluginId = pluginNode.name;
              var appType = HydratorPlusPlusConfigStore.getAppType();
              var sourceConnections = HydratorPlusPlusConfigStore.getSourceConnections(pluginId);
              var sourceNodes = HydratorPlusPlusConfigStore.getSourceNodes(pluginId);
              var artifactVersion = HydratorPlusPlusConfigStore.getArtifact().version;
              return {
                pluginNode: pluginNode,
                appType: appType,
                sourceConnections: sourceConnections,
                sourceNodes: sourceNodes,
                artifactVersion: artifactVersion
              };
            }]
          }
        }).result.then(this.modalCallback.bind(this), this.modalCallback.bind(this)); // Both close and ESC events in the modal are considered as SUCCESS and ERROR in promise callback. Hence the same callback for both success & failure.

        this.nodeConfigModalOpen = true;
      }
    }, {
      key: "modalCallback",
      value: function modalCallback() {
        this.deleteNode();
        this.nodeConfigModalOpen = false;
      }
    }, {
      key: "deleteNode",
      value: function deleteNode() {
        this.DAGPlusPlusNodesActionsFactory.resetSelectedNode();
        this.setStateAndUpdateConfigStore();
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusCreateCanvasCtrl;
  }();

  HydratorPlusPlusCreateCanvasCtrl.$inject = ['DAGPlusPlusNodesStore', 'HydratorPlusPlusConfigStore', 'HydratorPlusPlusHydratorService', '$uibModal', 'GLOBALS', 'DAGPlusPlusNodesActionsFactory', 'HydratorPlusPlusPreviewStore', '$scope'];
  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusCreateCanvasCtrl', HydratorPlusPlusCreateCanvasCtrl);
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
  /* /controllers/create/create-studio-ctrl.js */

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
  var HydratorPlusPlusStudioCtrl = /*#__PURE__*/function () {
    // Holy cow. Much DI. Such angular.
    HydratorPlusPlusStudioCtrl.$inject = ["HydratorPlusPlusConfigActions", "$stateParams", "rConfig", "$rootScope", "$scope", "DAGPlusPlusNodesActionsFactory", "HydratorPlusPlusHydratorService", "HydratorPlusPlusConsoleActions", "rSelectedArtifact", "rArtifacts", "myLocalStorage", "HydratorPlusPlusConfigStore", "$window", "HydratorPlusPlusConsoleTabService", "HydratorUpgradeService"];
    function HydratorPlusPlusStudioCtrl(HydratorPlusPlusConfigActions, $stateParams, rConfig, $rootScope, $scope, DAGPlusPlusNodesActionsFactory, HydratorPlusPlusHydratorService, HydratorPlusPlusConsoleActions, rSelectedArtifact, rArtifacts, myLocalStorage, HydratorPlusPlusConfigStore, $window, HydratorPlusPlusConsoleTabService, HydratorUpgradeService) {
      'ngInject'; // This is required because before we fireup the actions related to the store, the store has to be initialized to register for any events.

      var _this = this;

      _classCallCheck(this, HydratorPlusPlusStudioCtrl);

      this.myLocalStorage = myLocalStorage;
      this.myLocalStorage.get('hydrator++-leftpanel-isExpanded').then(function (isExpanded) {
        return _this.isExpanded = isExpanded === false ? false : true;
      })["catch"](function () {
        return _this.isExpanded = true;
      }); // FIXME: This should essentially be moved to a scaffolding service that will do stuff for a state/view

      HydratorPlusPlusConsoleTabService.listen();
      $scope.$on('$destroy', function () {
        HydratorPlusPlusConsoleTabService.unsubscribe();
        HydratorPlusPlusConsoleActions.resetMessages();
        $window.onbeforeunload = null;
      });

      var getValidArtifact = function getValidArtifact() {
        var isValidArtifact;

        if (rArtifacts.length) {
          isValidArtifact = rArtifacts.filter(function (r) {
            return r.name === rSelectedArtifact;
          });
        }

        return isValidArtifact.length ? isValidArtifact[0] : rArtifacts[0];
      };

      var artifact = getValidArtifact();

      if (rConfig.valid && rConfig.config) {
        var modifiedConfig = angular.copy(rConfig.config);

        if (!modifiedConfig.artifact) {
          modifiedConfig.artifact = artifact;
        } // remove backendProperties from rConfig to force re-fetching of properties


        if (modifiedConfig.config && modifiedConfig.config.stages) {
          modifiedConfig.config.stages.forEach(function (stage) {
            if (stage._backendProperties) {
              delete stage._backendProperties;
            }
          });
        }

        HydratorPlusPlusConfigActions.initializeConfigStore(modifiedConfig);
        var configJson = modifiedConfig;
        configJson = HydratorPlusPlusHydratorService.getNodesAndConnectionsFromConfig(modifiedConfig, true);
        configJson['__ui__'] = Object.assign({}, modifiedConfig.__ui__, {
          nodes: configJson.nodes.map(function (node) {
            node.properties = node.plugin.properties;
            node.label = node.plugin.label;
            return node;
          })
        });
        configJson.config = {
          connections: configJson.connections,
          comments: configJson.comments
        };
        DAGPlusPlusNodesActionsFactory.createGraphFromConfig(configJson.__ui__.nodes, configJson.config.connections, configJson.config.comments);
      } else {
        var config = {};
        config.artifact = artifact;
        HydratorPlusPlusConfigActions.initializeConfigStore(config);

        if (rConfig.upgrade) {
          HydratorUpgradeService.openUpgradeModal(rConfig.config, false);
        }
      }

      if ($stateParams.resourceCenterId) {
        var jsonData = $window.localStorage.getItem($stateParams.resourceCenterId);

        if (!jsonData) {
          return;
        }

        HydratorUpgradeService.openUpgradeModal(jsonData);
        $window.localStorage.removeItem($stateParams.resourceCenterId);
      }

      function customConfirm(message) {
        var start = Date.now();
        var result = confirm(message);
        var timeDifference = Date.now() - start;
        /*
          FIXME: This can easily be prevented if we upgrade to angular ui router version > 0.2.16.
           This is just to confirm if the suppression is by the browser or
           a human interventation (too quick a reply). If the time difference is less then 50ms
           In the worst case a super human clicks on ok or cancel within 50ms and we show the confirm
           popup once again. Otherwise this loop is to check if its a browser native supression.
           If it is then we just return true.
            The reasoning behind this is the user has selected 'Prevent this page from showing any additional dialogs' while clicking OK in the popup and so any dirty state checks are inherently skipped based on that choice.
        */

        for (var i = 0; i < 10 && !result && timeDifference < 50; i++) {
          start = Date.now();
          result = confirm(message);
          timeDifference = Date.now() - start;
        }

        if (timeDifference < 50) {
          return true;
        }

        return result;
      }

      var confirmOnPageExit = function confirmOnPageExit(e) {
        if (!HydratorPlusPlusConfigStore.getIsStateDirty()) {
          return;
        } // If we haven't been passed the event get the window.event


        e = e || $window.event;
        var message = 'You have unsaved changes.'; // For IE6-8 and Firefox prior to version 4

        if (e) {
          e.returnValue = message;
        } // For Chrome, Safari, IE8+ and Opera 12+


        return message;
      };

      if (!window.parent.Cypress) {
        $window.onbeforeunload = confirmOnPageExit;
      }

      $scope.$on('$stateChangeStart', function (event) {
        if (HydratorPlusPlusConfigStore.getIsStateDirty()) {
          var response = customConfirm('You have unsaved changes. Are you sure you want to exit this page?');

          if (!response) {
            event.preventDefault();
          }
        }
      });
    }

    _createClass(HydratorPlusPlusStudioCtrl, [{
      key: "toggleSidebar",
      value: function toggleSidebar() {
        this.isExpanded = !this.isExpanded;
        this.myLocalStorage.set('hydrator++-leftpanel-isExpanded', this.isExpanded);
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusStudioCtrl;
  }();

  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusStudioCtrl', HydratorPlusPlusStudioCtrl);
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
  /* /controllers/create/leftpanel-ctrl.js */

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
  var HydratorPlusPlusLeftPanelCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusLeftPanelCtrl.$inject = ["$scope", "$stateParams", "rVersion", "HydratorPlusPlusConfigStore", "HydratorPlusPlusLeftPanelStore", "HydratorPlusPlusPluginActions", "DAGPlusPlusFactory", "DAGPlusPlusNodesActionsFactory", "NonStorePipelineErrorFactory", "$uibModal", "myAlertOnValium", "$state", "$q", "rArtifacts", "PluginTemplatesDirActions", "HydratorPlusPlusOrderingFactory", "LEFTPANELSTORE_ACTIONS", "myHelpers", "$timeout", "mySettings", "PipelineAvailablePluginsActions", "AvailablePluginsStore", "AVAILABLE_PLUGINS_ACTIONS"];
    function HydratorPlusPlusLeftPanelCtrl($scope, $stateParams, rVersion, HydratorPlusPlusConfigStore, HydratorPlusPlusLeftPanelStore, HydratorPlusPlusPluginActions, DAGPlusPlusFactory, DAGPlusPlusNodesActionsFactory, NonStorePipelineErrorFactory, $uibModal, myAlertOnValium, $state, $q, rArtifacts, PluginTemplatesDirActions, HydratorPlusPlusOrderingFactory, LEFTPANELSTORE_ACTIONS, myHelpers, $timeout, mySettings, PipelineAvailablePluginsActions, AvailablePluginsStore, AVAILABLE_PLUGINS_ACTIONS) {
      var _this = this;

      _classCallCheck(this, HydratorPlusPlusLeftPanelCtrl);

      this.$state = $state;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.HydratorPlusPlusConfigStore = HydratorPlusPlusConfigStore;
      this.DAGPlusPlusFactory = DAGPlusPlusFactory;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.NonStorePipelineErrorFactory = NonStorePipelineErrorFactory;
      this.PluginTemplatesDirActions = PluginTemplatesDirActions;
      this.rVersion = rVersion;
      this.leftpanelStore = HydratorPlusPlusLeftPanelStore;
      this.myAlertOnValium = myAlertOnValium;
      this.$q = $q;
      this.HydratorPlusPlusOrderingFactory = HydratorPlusPlusOrderingFactory;
      this.leftpanelActions = HydratorPlusPlusPluginActions;
      this.LEFTPANELSTORE_ACTIONS = LEFTPANELSTORE_ACTIONS;
      this.myHelpers = myHelpers;
      this.mySettings = mySettings;
      this.PipelineAvailablePluginsActions = PipelineAvailablePluginsActions;
      this.AvailablePluginsStore = AvailablePluginsStore;
      this.AVAILABLE_PLUGINS_ACTIONS = AVAILABLE_PLUGINS_ACTIONS;
      this.pluginsMap = [];
      this.sourcesToVersionMap = {};
      this.transformsToVersionMap = {};
      this.sinksToVersionMap = {};
      this.artifacts = rArtifacts;
      var configStoreArtifact = this.HydratorPlusPlusConfigStore.getArtifact();
      this.selectedArtifact = rArtifacts.filter(function (ar) {
        return ar.name === configStoreArtifact.name;
      })[0];
      this.artifactToRevert = this.selectedArtifact;
      this.availablePluginMap = this.AvailablePluginsStore.getState().plugins.pluginsMap;
      this.onV2ItemClicked = this.onV2ItemClicked.bind(this);
      this.init();
      var sub = this.leftpanelStore.subscribe(function () {
        var state = _this.leftpanelStore.getState();

        var extensions = state.extensions;
        var pluginsList = state.plugins.pluginTypes;

        _this.pluginsMap.splice(0, _this.pluginsMap.length);

        if (!extensions.length) {
          return;
        }

        extensions.forEach(function (ext) {
          var fetchPluginsFromMap = function fetchPluginsFromMap(ext) {
            return _this.pluginsMap.filter(function (pluginObj) {
              return pluginObj.name === _this.HydratorPlusPlusOrderingFactory.getPluginTypeDisplayName(ext);
            });
          };

          var plugins = pluginsList[ext];
          var fetchedPluginsMap = fetchPluginsFromMap(ext);

          if (!fetchedPluginsMap.length) {
            _this.pluginsMap.push({
              name: _this.HydratorPlusPlusOrderingFactory.getPluginTypeDisplayName(ext),
              plugins: plugins,
              pluginTypes: [ext] // Since we group plugin types now under one label we need ot keep track of fetchPlugins call for each plugin type.

            });
          } else {
            fetchedPluginsMap[0].plugins = fetchedPluginsMap[0].plugins.concat(plugins);
            fetchedPluginsMap[0].pluginTypes.push(ext);
          }
        });
        _this.pluginsMap = _this.HydratorPlusPlusOrderingFactory.orderPluginTypes(_this.pluginsMap);
      });
      var availablePluginSub = this.AvailablePluginsStore.subscribe(function () {
        _this.availablePluginMap = _this.AvailablePluginsStore.getState().plugins.pluginsMap;
      });
      var leftPanelStoreTimeout = $timeout(function () {
        _this.leftpanelStore.dispatch({
          type: _this.LEFTPANELSTORE_ACTIONS.PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE
        });

        var defaultVersionMap = _this.leftpanelStore.getState().plugins.pluginToVersionMap;

        _this.mySettings.get('CURRENT_CDAP_VERSION').then(function (defaultCDAPVersion) {
          if (_this.rVersion.version !== defaultCDAPVersion) {
            return _this.mySettings.set('plugin-default-version', {}).then(function () {
              _this.mySettings.set('CURRENT_CDAP_VERSION', _this.rVersion.version);
            });
          }

          _this.mySettings.set('plugin-default-version', defaultVersionMap);
        });
      }, 10000);
      this.leftPanelStoreFetchExtension = this.leftPanelStoreFetchExtension.bind(this);
      var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
      var globalEvents = window.CaskCommon.globalEvents;
      eventEmitter.on(globalEvents.ARTIFACTUPLOAD, this.leftPanelStoreFetchExtension);
      this.$uibModal = $uibModal;
      this.$scope.$on('$destroy', function () {
        _this.leftpanelStore.dispatch({
          type: _this.LEFTPANELSTORE_ACTIONS.RESET
        });

        sub();
        availablePluginSub();
        $timeout.cancel(leftPanelStoreTimeout);

        _this.AvailablePluginsStore.dispatch({
          type: _this.AVAILABLE_PLUGINS_ACTIONS.reset
        });

        eventEmitter.off(globalEvents.ARTIFACTUPLOAD, _this.leftPanelStoreFetchExtension);
      });
    }

    _createClass(HydratorPlusPlusLeftPanelCtrl, [{
      key: "init",
      value: function init() {
        this.PipelineAvailablePluginsActions.fetchPlugins({
          namespace: this.$stateParams.namespace,
          pipelineType: this.selectedArtifact.name,
          version: this.rVersion.version,
          scope: this.$scope
        });
        this.leftpanelStore.dispatch(this.leftpanelActions.fetchDefaultVersion());
      }
    }, {
      key: "leftPanelStoreFetchExtension",
      value: function leftPanelStoreFetchExtension() {
        this.leftpanelStore.dispatch({
          type: this.LEFTPANELSTORE_ACTIONS.RESET
        });
        this.pluginsMap.splice(0, this.pluginsMap.length);
        this.init();
      }
    }, {
      key: "onArtifactChange",
      value: function onArtifactChange() {
        var _this2 = this;

        this._checkAndShowConfirmationModalOnDirtyState().then(function (proceedToNextStep) {
          if (!proceedToNextStep) {
            _this2.selectedArtifact = _this2.artifactToRevert;
          } else {
            _this2.HydratorPlusPlusConfigStore.setState(_this2.HydratorPlusPlusConfigStore.getDefaults());

            _this2.$state.go('hydrator.create', {
              namespace: _this2.$state.params.namespace,
              artifactType: _this2.selectedArtifact.name,
              data: null
            }, {
              reload: true,
              inherit: false
            });
          }
        });
      }
    }, {
      key: "_checkAndShowConfirmationModalOnDirtyState",
      value: function _checkAndShowConfirmationModalOnDirtyState(proceedCb) {
        var goTonextStep = true;
        var isStoreDirty = this.HydratorPlusPlusConfigStore.getIsStateDirty();

        if (isStoreDirty) {
          return this.$uibModal.open({
            templateUrl: '/assets/features/hydrator/templates/create/popovers/canvas-overwrite-confirmation.html',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            windowTopClass: 'confirm-modal hydrator-modal center',
            controller: ['$scope', 'HydratorPlusPlusConfigStore', 'HydratorPlusPlusConfigActions', function ($scope, HydratorPlusPlusConfigStore, HydratorPlusPlusConfigActions) {
              $scope.isSaving = false;

              $scope.discard = function () {
                goTonextStep = true;

                if (proceedCb) {
                  proceedCb();
                }

                $scope.$close();
              };

              $scope.save = function () {
                var pipelineName = HydratorPlusPlusConfigStore.getName();

                if (!pipelineName.length) {
                  HydratorPlusPlusConfigActions.saveAsDraft();
                  goTonextStep = false;
                  $scope.$close();
                  return;
                }

                var unsub = HydratorPlusPlusConfigStore.registerOnChangeListener(function () {
                  var isStateDirty = HydratorPlusPlusConfigStore.getIsStateDirty(); // This is solely used for showing the spinner icon until the modal is closed.

                  if (!isStateDirty) {
                    unsub();
                    goTonextStep = true;
                    $scope.$close();
                  }
                });
                HydratorPlusPlusConfigActions.saveAsDraft();
                $scope.isSaving = true;
              };

              $scope.cancel = function () {
                $scope.$close();
                goTonextStep = false;
              };
            }]
          }).closed.then(function () {
            return goTonextStep;
          });
        } else {
          if (proceedCb) {
            proceedCb();
          }

          return this.$q.when(goTonextStep);
        }
      }
      /**
       * This is a copy of onLeftSidePanelItemClicked
       * with the scope bound to the function -- copied
       * so we don't break original functionality
       */

    }, {
      key: "onV2ItemClicked",
      value: function onV2ItemClicked(event, node) {
        event.stopPropagation();

        if (node.action === 'createTemplate') {
          this.createPluginTemplate(node.contentData, 'create');
        } else if (node.action === 'deleteTemplate') {
          this.deletePluginTemplate(node.contentData);
        } else if (node.action === 'editTemplate') {
          this.createPluginTemplate(node.contentData, 'edit');
        } else {
          this.addPluginToCanvas(event, node);
        }
      }
    }, {
      key: "onLeftSidePanelItemClicked",
      value: function onLeftSidePanelItemClicked(event, node) {
        event.stopPropagation();

        if (node.action === 'createTemplate') {
          this.createPluginTemplate(node.contentData, 'create');
        } else if (node.action === 'deleteTemplate') {
          this.deletePluginTemplate(node.contentData);
        } else if (node.action === 'editTemplate') {
          this.createPluginTemplate(node.contentData, 'edit');
        } else {
          this.addPluginToCanvas(event, node);
        }
      }
    }, {
      key: "deletePluginTemplate",
      value: function deletePluginTemplate(node) {
        var templateType = this.HydratorPlusPlusConfigStore.getArtifact().name;
        this.$uibModal.open({
          templateUrl: '/assets/features/hydrator/templates/partial/plugin-delete-confirmation.html',
          size: 'lg',
          backdrop: 'static',
          keyboard: false,
          windowTopClass: 'confirm-modal hydrator-modal',
          controller: 'PluginTemplatesDeleteCtrl',
          resolve: {
            rNode: function rNode() {
              return node;
            },
            rTemplateType: function rTemplateType() {
              return templateType;
            }
          }
        });
      }
    }, {
      key: "createPluginTemplate",
      value: function createPluginTemplate(node, mode) {
        var _this3 = this;

        var templateType = this.HydratorPlusPlusConfigStore.getArtifact().name;
        this.$uibModal.open({
          templateUrl: '/assets/features/hydrator/templates/create/popovers/plugin-templates.html',
          size: 'lg',
          backdrop: 'static',
          keyboard: false,
          windowTopClass: 'plugin-templates-modal hydrator-modal node-config-modal',
          controller: 'PluginTemplatesCreateEditCtrl',
          resolve: {
            rTemplateType: function rTemplateType() {
              return templateType;
            }
          }
        }).rendered.then(function () {
          _this3.PluginTemplatesDirActions.init({
            templateType: node.templateType || _this3.selectedArtifact.name,
            pluginType: node.pluginType || node.type,
            mode: mode === 'edit' ? 'edit' : 'create',
            templateName: node.pluginTemplate,
            pluginName: node.pluginName || node.name
          });
        });
      }
    }, {
      key: "addPluginToCanvas",
      value: function addPluginToCanvas(event, node) {
        var _this4 = this;

        var getMatchedPlugin = function getMatchedPlugin(plugin) {
          if (plugin.pluginTemplate) {
            return plugin;
          }

          var item = [plugin];

          var plugins = _this4.leftpanelStore.getState().plugins.pluginTypes[node.type];

          var matchedPlugin = plugins.filter(function (plug) {
            return plug.name === node.name && !plug.pluginTemplate;
          });

          if (matchedPlugin.length) {
            item = matchedPlugin[0].allArtifacts.filter(function (plug) {
              return angular.equals(plug.artifact, plugin.defaultArtifact);
            });
          }

          return item[0];
        };

        var item;

        if (node.templateName) {
          item = node;
        } else {
          item = getMatchedPlugin(node);
          this.leftpanelStore.dispatch(this.leftpanelActions.updateDefaultVersion(item));
        }

        this.DAGPlusPlusNodesActionsFactory.resetSelectedNode();
        var name = item.name || item.pluginTemplate;
        var configProperties = {};
        var configurationGroups;
        var widgets;

        if (!item.pluginTemplate) {
          var itemArtifact = item.artifact;
          var key = "".concat(item.name, "-").concat(item.type, "-").concat(itemArtifact.name, "-").concat(itemArtifact.version, "-").concat(itemArtifact.scope);
          widgets = this.myHelpers.objectQuery(this.availablePluginMap, key, 'widgets');
          var displayName = this.myHelpers.objectQuery(widgets, 'display-name');
          configurationGroups = this.myHelpers.objectQuery(widgets, 'configuration-groups');

          if (configurationGroups && configurationGroups.length > 0) {
            configurationGroups.forEach(function (cg) {
              cg.properties.forEach(function (prop) {
                configProperties[prop.name] = _this4.myHelpers.objectQuery(prop, 'widget-attributes', 'default');
              });
            });
          }

          name = displayName || name;
        }

        var filteredNodes = this.HydratorPlusPlusConfigStore.getNodes().filter(function (node) {
          return node.plugin.label ? node.plugin.label.indexOf(name) !== -1 : false;
        });
        var config;

        if (item.pluginTemplate) {
          config = {
            plugin: {
              label: filteredNodes.length > 0 ? item.pluginTemplate + (filteredNodes.length + 1) : item.pluginTemplate,
              name: item.pluginName,
              artifact: item.artifact,
              properties: item.properties
            },
            icon: this.DAGPlusPlusFactory.getIcon(item.pluginName),
            type: item.pluginType,
            outputSchema: item.outputSchema,
            inputSchema: item.inputSchema,
            pluginTemplate: item.pluginTemplate,
            description: item.description,
            lock: item.lock,
            configGroups: configurationGroups,
            filters: widgets && widgets.filters
          };
        } else {
          config = {
            plugin: {
              label: filteredNodes.length > 0 ? name + (filteredNodes.length + 1) : name,
              artifact: item.artifact,
              name: item.name,
              properties: configProperties
            },
            icon: item.icon,
            description: item.description,
            type: item.type,
            warning: true,
            configGroups: configurationGroups,
            filters: widgets && widgets.filters
          };
        }

        this.DAGPlusPlusNodesActionsFactory.addNode(config);
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusLeftPanelCtrl;
  }();

  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusLeftPanelCtrl', HydratorPlusPlusLeftPanelCtrl);
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
  /* /controllers/create/toppanel-ctrl.js */

  /*
   * Copyright © 2015-2020 Cask Data, Inc.
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
  var HydratorPlusPlusTopPanelCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusTopPanelCtrl.$inject = ["$stateParams", "HydratorPlusPlusConfigStore", "HydratorPlusPlusConfigActions", "$uibModal", "DAGPlusPlusNodesActionsFactory", "GLOBALS", "myHelpers", "HydratorPlusPlusConsoleStore", "myPipelineExportModalService", "$timeout", "$scope", "HydratorPlusPlusPreviewStore", "HydratorPlusPlusPreviewActions", "$interval", "myPipelineApi", "$state", "MyCDAPDataSource", "myAlertOnValium", "MY_CONFIG", "PREVIEWSTORE_ACTIONS", "$q", "NonStorePipelineErrorFactory", "rArtifacts", "$window", "myPreviewLogsApi", "DAGPlusPlusNodesStore", "myPreferenceApi", "HydratorPlusPlusHydratorService", "$rootScope", "uuid", "HydratorUpgradeService"];
    function HydratorPlusPlusTopPanelCtrl($stateParams, HydratorPlusPlusConfigStore, HydratorPlusPlusConfigActions, $uibModal, DAGPlusPlusNodesActionsFactory, GLOBALS, myHelpers, HydratorPlusPlusConsoleStore, myPipelineExportModalService, $timeout, $scope, HydratorPlusPlusPreviewStore, HydratorPlusPlusPreviewActions, $interval, myPipelineApi, $state, MyCDAPDataSource, myAlertOnValium, MY_CONFIG, PREVIEWSTORE_ACTIONS, $q, NonStorePipelineErrorFactory, rArtifacts, $window, myPreviewLogsApi, DAGPlusPlusNodesStore, myPreferenceApi, HydratorPlusPlusHydratorService, $rootScope, uuid, HydratorUpgradeService) {
      var _this = this;

      _classCallCheck(this, HydratorPlusPlusTopPanelCtrl);

      this.consoleStore = HydratorPlusPlusConsoleStore;
      this.myPipelineExportModalService = myPipelineExportModalService;
      this.HydratorPlusPlusConfigStore = HydratorPlusPlusConfigStore;
      this.GLOBALS = GLOBALS;
      this.HydratorPlusPlusConfigActions = HydratorPlusPlusConfigActions;
      this.$uibModal = $uibModal;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.parsedDescription = this.HydratorPlusPlusConfigStore.getDescription();
      this.myHelpers = myHelpers;
      this.$timeout = $timeout;
      this.PREVIEWSTORE_ACTIONS = PREVIEWSTORE_ACTIONS;
      this.previewStore = HydratorPlusPlusPreviewStore;
      this.previewActions = HydratorPlusPlusPreviewActions;
      this.$interval = $interval;
      this.myPipelineApi = myPipelineApi;
      this.myPreviewLogsApi = myPreviewLogsApi;
      this.myPreferenceApi = myPreferenceApi;
      this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
      this.$state = $state;
      this.dataSrc = new MyCDAPDataSource($scope);
      this.myAlertOnValium = myAlertOnValium;
      this.currentPreviewId = null;
      this.$window = $window;
      this.viewConfig = false;
      this.viewScheduler = false;
      this.viewLogs = false;
      this.$q = $q;
      this.NonStorePipelineErrorFactory = NonStorePipelineErrorFactory;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.artifacts = rArtifacts;
      this.$rootScope = $rootScope;
      this.uuid = uuid;
      this.macrosMap = {};
      this.resolvedMacros = {};
      this.userRuntimeArgumentsMap = {};
      this.runtimeArguments = {};
      this.doesPreviewHaveEmptyMacros = true;
      this.$stateParams = $stateParams;
      this.HydratorUpgradeService = HydratorUpgradeService;
      this.closeLogs = this.closeLogs.bind(this);
      this.setState();
      this.setActiveNodes();
      this.HydratorPlusPlusConfigStore.registerOnChangeListener(this.setState.bind(this));
      this.DAGPlusPlusNodesStore.registerOnChangeListener(this.setActiveNodes.bind(this));
      this.focusTimeout = null;
      this.fetchMacrosTimeout = null;
      this.timeoutInMinutes = 2;
      var themeShowSchedule = window.CaskCommon.ThemeHelper.Theme.showSchedules !== false;
      this.showSchedule = this.state.artifact.name === this.GLOBALS.etlDataPipeline && themeShowSchedule;

      if ($stateParams.isClone) {
        this.openMetadata();
      }

      this.currentDraftId = this.HydratorPlusPlusConfigStore.getDraftId();

      if (this.currentDraftId && this.currentDraftId === this.$window.localStorage.getItem('LastDraftId') && this.$window.localStorage.getItem('LastPreviewId') !== 'null') {
        this.currentPreviewId = this.$window.localStorage.getItem('LastPreviewId');
        this.previewStore.dispatch(this.previewActions.setPreviewId(this.currentPreviewId));
      }

      this.isPreviewEnabled = angular.isObject(MY_CONFIG.hydrator) && MY_CONFIG.hydrator.previewEnabled === true;
      this.previewMode = false;
      this.previewLoading = true;

      if (this.currentPreviewId) {
        this.myPreviewLogsApi.getLogsStatus({
          namespace: this.$state.params.namespace,
          previewId: this.currentPreviewId
        }).$promise.then(function (statusRes) {
          _this.previewStartTime = statusRes.submitTime;
          _this.previewLoading = false;

          _this.previewStore.dispatch({
            type: _this.PREVIEWSTORE_ACTIONS.SET_PREVIEW_STATUS,
            payload: {
              status: statusRes.status
            }
          });

          var _window$CaskCommon$PR = window.CaskCommon.PREVIEW_STATUS,
              WAITING = _window$CaskCommon$PR.WAITING,
              ACQUIRED = _window$CaskCommon$PR.ACQUIRED,
              INIT = _window$CaskCommon$PR.INIT,
              RUNNING = _window$CaskCommon$PR.RUNNING;

          _this.updateTimerLabelAndTitle(statusRes);

          if ([WAITING, ACQUIRED, INIT, RUNNING].includes(statusRes.status)) {
            _this.previewRunning = true;

            _this.startTimer();

            _this.startPollPreviewStatus(_this.currentPreviewId);
          } else {
            _this.calculateDuration(statusRes.endTime);
          }
        }, function (statusErr) {
          console.log('ERROR: ', statusErr);

          _this.setDefault();
        });
      } else {
        this.setDefault();
      }

      var unsub = this.previewStore.subscribe(function () {
        var state = _this.previewStore.getState().preview;

        _this.previewMode = state.isPreviewModeEnabled;
        _this.macrosMap = state.macros;
        _this.userRuntimeArgumentsMap = state.userRuntimeArguments;
        _this.timeoutInMinutes = state.timeoutInMinutes;
      });
      this.macrosMap = this.previewStore.getState().preview.macros;
      this.userRuntimeArgumentsMap = this.previewStore.getState().preview.userRuntimeArguments;

      if (Object.keys(this.macrosMap).length === 0) {
        if (this.fetchMacrosTimeout) {
          this.$timeout.cancel(this.fetchMacrosTimeout);
        }

        this.fetchMacrosTimeout = this.$timeout(function () {
          _this.fetchMacros();
        });
      }

      $scope.$on('$destroy', function () {
        unsub();

        _this.stopPreview(true);

        _this.previewStore.dispatch(_this.previewActions.togglePreviewMode(false));

        _this.previewStore.dispatch(_this.previewActions.resetPreview());

        _this.$interval.cancel(_this.previewTimerInterval);

        _this.$timeout.cancel(_this.focusTimeout);

        _this.$timeout.cancel(_this.fetchMacrosTimeout);
      });
    }

    _createClass(HydratorPlusPlusTopPanelCtrl, [{
      key: "setDefault",
      value: function setDefault() {
        this.previewStartTime = null;
        this.setDisplayDuration();
        this.updateTimerLabelAndTitle();
        this.previewTimerInterval = null;
        this.previewLoading = false;
        this.previewRunning = false;
      }
    }, {
      key: "setMetadata",
      value: function setMetadata(metadata) {
        this.state.metadata = metadata;
      }
    }, {
      key: "setState",
      value: function setState() {
        this.state = {
          metadata: {
            name: this.HydratorPlusPlusConfigStore.getName(),
            description: this.HydratorPlusPlusConfigStore.getDescription()
          },
          viewSettings: this.myHelpers.objectQuery(this.state, 'viewSettings') || false,
          artifact: this.HydratorPlusPlusConfigStore.getArtifact()
        };
      }
    }, {
      key: "setActiveNodes",
      value: function setActiveNodes() {
        this.hasNodes = !!this.DAGPlusPlusNodesStore.getNodes().length;
        this.fetchMacros();
      }
    }, {
      key: "openMetadata",
      value: function openMetadata() {
        this.metadataExpanded = true;
        this.invalidName = false;
        this.$timeout.cancel(this.focusTimeout);
        this.focusTimeout = this.$timeout(function () {
          document.getElementById('pipeline-name-input').focus();
        });
      }
    }, {
      key: "resetMetadata",
      value: function resetMetadata(event) {
        this.setState();
        this.metadataExpanded = false;
        event.preventDefault();
        event.stopPropagation();
      }
    }, {
      key: "saveMetadata",
      value: function saveMetadata(event) {
        this.HydratorPlusPlusConfigActions.setMetadataInfo(this.state.metadata.name, this.state.metadata.description);

        if (this.state.metadata.description) {
          this.parsedDescription = this.state.metadata.description.replace(/\n/g, ' ');
          this.tooltipDescription = this.state.metadata.description.replace(/\n/g, '<br />');
        } else {
          this.parsedDescription = '';
          this.tooltipDescription = '';
        }

        this.metadataExpanded = false;
        event.preventDefault();
        event.stopPropagation();
        this.onSaveDraft();
      }
    }, {
      key: "onEnterOnMetadata",
      value: function onEnterOnMetadata(event) {
        // Save when user hits ENTER key.
        if (event.keyCode === 13) {
          this.saveMetadata(event);
          this.metadataExpanded = false;
        } else if (event.keyCode === 27) {
          // Reset if the user hits ESC key.
          this.resetMetadata(event);
        }
      }
    }, {
      key: "onImport",
      value: function onImport() {
        var fileBrowserClickCB = function fileBrowserClickCB() {
          document.getElementById('pipeline-import-config-link').click();
        }; // This is not using the promise pattern as browsers NEED to have the click on the call stack to generate the click on input[type=file] button programmatically in like line:115.
        // When done in promise we go into the promise ticks and the then callback is called in the next tick which prevents the browser to open the file dialog
        // as a file dialog is opened ONLY when manually clicked by the user OR transferring the click to another button in the same call stack
        // TL;DR Can't open file dialog programmatically. If we need to, we need to transfer the click from a user on a button directly into the input file dialog button.


        this._checkAndShowConfirmationModalOnDirtyState(fileBrowserClickCB);
      }
    }, {
      key: "onExport",
      value: function onExport() {
        this.DAGPlusPlusNodesActionsFactory.resetSelectedNode();
        var config = angular.copy(this.HydratorPlusPlusConfigStore.getDisplayConfig());
        var exportConfig = this.HydratorPlusPlusConfigStore.getConfigForExport();
        delete exportConfig.__ui__; // Only show export modal with pipeline JSON when running e2e tests

        if (window.Cypress) {
          this.myPipelineExportModalService.show(config, exportConfig);
        } else {
          window.CaskCommon.DownloadFile(exportConfig);
        }
      }
    }, {
      key: "onSaveDraft",
      value: function onSaveDraft() {
        this.HydratorPlusPlusConfigActions.saveAsDraft();
        this.checkNameError();
        this.$window.localStorage.setItem('LastDraftId', this.HydratorPlusPlusConfigStore.getDraftId());
        this.$window.localStorage.setItem('LastPreviewId', this.currentPreviewId);
      }
    }, {
      key: "checkNameError",
      value: function checkNameError() {
        var messages = this.consoleStore.getMessages() || [];
        var filteredMessages = messages.filter(function (message) {
          return ['MISSING-NAME', 'INVALID-NAME'].indexOf(message.type) !== -1;
        });
        this.invalidName = filteredMessages.length ? true : false;
      }
    }, {
      key: "onPublish",
      value: function onPublish() {
        this.HydratorPlusPlusConfigActions.publishPipeline();
        this.checkNameError();
      }
    }, {
      key: "showSettings",
      value: function showSettings() {
        this.state.viewSettings = !this.state.viewSettings;
      } // PREVIEW

    }, {
      key: "setStartTime",
      value: function setStartTime() {
        var startTime = new Date();
        this.previewStartTime = startTime;
        this.previewStore.dispatch(this.previewActions.setPreviewStartTime(startTime));
      }
    }, {
      key: "startTimer",
      value: function startTimer() {
        var _this2 = this;

        this.previewTimerInterval = this.$interval(function () {
          _this2.calculateDuration();
        }, 500);
      }
    }, {
      key: "stopTimer",
      value: function stopTimer() {
        this.$interval.cancel(this.previewTimerInterval);
      }
    }, {
      key: "calculateDuration",
      value: function calculateDuration(endTime) {
        if (!endTime) {
          endTime = new Date();
        }

        var duration = (endTime - this.previewStartTime) / 1000;
        duration = duration >= 0 ? duration : 0;
        var minutes = Math.floor(duration / 60);
        var seconds = Math.floor(duration % 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        this.setDisplayDuration(minutes, seconds);
      }
    }, {
      key: "setDisplayDuration",
      value: function setDisplayDuration(minutes, seconds) {
        this.displayDuration = {
          minutes: minutes || '--',
          seconds: seconds || '--'
        };
      }
    }, {
      key: "updateTimerLabelAndTitle",
      value: function updateTimerLabelAndTitle(res) {
        // set default
        if (!res) {
          this.timerLabel = this.GLOBALS.en.hydrator.studio.PREVIEW.timerLabels.DURATION;
          this.queueStatus = '';
          return;
        }

        var _window$CaskCommon$PR2 = window.CaskCommon.PREVIEW_STATUS,
            WAITING = _window$CaskCommon$PR2.WAITING,
            ACQUIRED = _window$CaskCommon$PR2.ACQUIRED,
            INIT = _window$CaskCommon$PR2.INIT,
            RUNNING = _window$CaskCommon$PR2.RUNNING;

        if (res.status === WAITING && res.positionInWaitingQueue > 0) {
          var runsAheadInQueue = res.positionInWaitingQueue;
          this.queueStatus = "".concat(runsAheadInQueue, " ").concat(runsAheadInQueue === 1 ? 'run' : 'runs', " ahead in queue");
          this.timerLabel = "".concat(runsAheadInQueue, " ").concat(this.GLOBALS.en.hydrator.studio.PREVIEW.timerLabels.PENDING);
        } else if ([WAITING, ACQUIRED, INIT, RUNNING].includes(res.status) && this.loadingLabel !== 'Stopping') {
          this.timerLabel = this.GLOBALS.en.hydrator.studio.PREVIEW.timerLabels.RUNNING;
          this.queueStatus = '';
        } else {
          this.timerLabel = this.GLOBALS.en.hydrator.studio.PREVIEW.timerLabels.DURATION;
          this.queueStatus = '';
        }
      }
    }, {
      key: "fetchMacros",
      value: function fetchMacros() {
        var newMacrosMap = {};
        var nodes = this.HydratorPlusPlusConfigStore.getNodes();

        for (var i = 0; i < nodes.length; i++) {
          var properties = this.myHelpers.objectQuery(nodes[i], 'plugin', 'properties');
          var backendProperties = this.myHelpers.objectQuery(nodes[i], '_backendProperties');

          for (var prop in properties) {
            if (properties.hasOwnProperty(prop) && backendProperties && backendProperties.hasOwnProperty(prop) && backendProperties[prop].macroSupported) {
              var macroString = properties[prop];
              /* Can handle:
                - Simple nested macro (e.g. '${function(${macro1})}')
                - Multiple macros (e.g. '${macro1}${macro2}')
                - And combined (e,g, '${function(${macro1})}${macro2}')
                More complicated cases will be handled by the backend
                 TODO: CDAP-17726 - We need API from backend to get macros, given a pipeline config
                The logic UI uses to parse and understand a macro is faulty and does not cover
                complex cases while running preview.
                 This is a temporary fix to not surface simple cases of macro functions.
                Hence the specific check for known macro functions that doesn't need user input.
              */

              if (macroString && typeof macroString === 'string' && macroString.indexOf('${') !== -1 && macroString.indexOf('}') !== -1 && macroString.indexOf('${logicalStartTime(') === -1 && macroString.indexOf('${secure(') === -1 && macroString.indexOf('${conn(') === -1 && macroString.indexOf('${oauth(') === -1) {
                var macroKeys = [];
                var currentMacroDepth = 0;
                var maxMacroDepth = 0;
                var lastClosingBraceIndex = 0;

                for (var _i = macroString.length - 1; _i >= 1; _i--) {
                  var macroChar = macroString[_i];

                  if (macroChar === '}') {
                    lastClosingBraceIndex = _i;
                    currentMacroDepth += 1;
                  }

                  if (macroChar === '{' && macroString[_i - 1] === '$') {
                    currentMacroDepth -= 1;

                    if (currentMacroDepth >= maxMacroDepth) {
                      maxMacroDepth = currentMacroDepth;
                      var macroKey = macroString.substring(_i + 1, lastClosingBraceIndex);
                      macroKeys.push(macroKey);
                    }
                  }
                }

                macroKeys.forEach(function (key) {
                  newMacrosMap[key] = '';
                });
              }
            }
          }
        }

        if (Object.keys(newMacrosMap).length > 0) {
          /*
            Will resolve macros from preferences, if the new macro object is different than
            the one we already have (this.macrosMap). We have a new macro object when the
            user adds or removes macro(s) from the config of a stage.
          */
          var differentMacroKeys = false;

          if (Object.keys(newMacrosMap).length !== Object.keys(this.macrosMap).length) {
            differentMacroKeys = true;
          } else {
            for (var _macroKey in newMacrosMap) {
              if (newMacrosMap.hasOwnProperty(_macroKey) && !this.macrosMap.hasOwnProperty(_macroKey)) {
                differentMacroKeys = true;
                break;
              }
            }
          }

          if (differentMacroKeys) {
            this.getRuntimeArguments(newMacrosMap);
          }
        } else {
          this.getRuntimeArguments(newMacrosMap);
        }
      }
    }, {
      key: "getRuntimeArguments",
      value: function getRuntimeArguments() {
        var _this3 = this;

        var newMacrosMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.macrosMap;

        // if there are no runtime arguments at all
        if (Object.keys(newMacrosMap).length === 0 && Object.keys(this.userRuntimeArgumentsMap).length === 0) {
          this.macrosMap = newMacrosMap;
          this.previewStore.dispatch(this.previewActions.setMacros(this.macrosMap));
          this.runtimeArguments.pairs = [{
            key: '',
            value: '',
            uniqueId: 'id-' + this.uuid.v4()
          }];
          this.doesPreviewHaveEmptyMacros = this.checkForEmptyMacrosForPreview();
          this.previewStore.dispatch(this.previewActions.setRuntimeArgsForDisplay(_.cloneDeep(this.runtimeArguments)));
          return this.$q.when(this.runtimeArguments);
        }

        this.macrosMap = this.previewStore.getState().preview.macros;
        this.userRuntimeArgumentsMap = this.previewStore.getState().preview.userRuntimeArguments;
        var currentRuntimeArgsForDisplay = this.previewStore.getState().preview.runtimeArgsForDisplay; // if there are non-zero number of macros

        if (Object.keys(newMacrosMap).length !== 0) {
          var preferenceParam = {
            namespace: this.$state.params.namespace
          };
          return this.myPreferenceApi.getNamespacePreferenceResolved(preferenceParam).$promise.then(function (res) {
            var newResolvedMacros = _this3.HydratorPlusPlusHydratorService.getPrefsRelevantToMacros(res, _this3.macrosMap);

            var newPrefs = {}; // if the higher level preferences have changed

            if (!angular.equals(newResolvedMacros, _this3.resolvedMacros)) {
              for (var macroKey in newResolvedMacros) {
                if (newResolvedMacros.hasOwnProperty(macroKey) && _this3.resolvedMacros.hasOwnProperty(macroKey) && _this3.macrosMap.hasOwnProperty(macroKey)) {
                  if (newResolvedMacros[macroKey] !== _this3.resolvedMacros[macroKey] && _this3.resolvedMacros[macroKey] === _this3.macrosMap[macroKey]) {
                    newPrefs[macroKey] = newResolvedMacros[macroKey];
                  }
                }
              }

              _this3.resolvedMacros = newResolvedMacros;
            }

            if (!angular.equals(newMacrosMap, _this3.macrosMap) || Object.keys(newPrefs).length > 0) {
              // if user added or removed macros in the stage config
              if (!angular.equals(newMacrosMap, _this3.macrosMap)) {
                _this3.resolvedMacros = Object.assign({}, _this3.HydratorPlusPlusHydratorService.getPrefsRelevantToMacros(res, newMacrosMap));
                _this3.macrosMap = Object.assign({}, newMacrosMap, _this3.resolvedMacros);
              } // only update the macros that have new resolved values


              if (Object.keys(newPrefs).length > 0) {
                _this3.resolvedMacros = Object.assign({}, _this3.resolvedMacros, newResolvedMacros);
                _this3.macrosMap = Object.assign({}, _this3.macrosMap, newPrefs);
              }

              _this3.previewStore.dispatch(_this3.previewActions.setMacros(_this3.macrosMap));
            }

            _this3.runtimeArguments = _this3.HydratorPlusPlusHydratorService.getRuntimeArgsForDisplay(currentRuntimeArgsForDisplay, _this3.macrosMap, _this3.userRuntimeArgumentsMap);

            _this3.previewStore.dispatch(_this3.previewActions.setRuntimeArgsForDisplay(_.cloneDeep(_this3.runtimeArguments)));

            _this3.doesPreviewHaveEmptyMacros = _this3.checkForEmptyMacrosForPreview();
            return _this3.runtimeArguments;
          }, function (err) {
            console.log('ERROR', err);
          }); // if there are zero macros, but there are user-set runtime arguments
        } else {
          this.macrosMap = newMacrosMap;
          this.previewStore.dispatch(this.previewActions.setMacros(this.macrosMap));
          this.runtimeArguments = this.HydratorPlusPlusHydratorService.getRuntimeArgsForDisplay(currentRuntimeArgsForDisplay, this.macrosMap, this.userRuntimeArgumentsMap);
          this.previewStore.dispatch(this.previewActions.setRuntimeArgsForDisplay(_.cloneDeep(this.runtimeArguments)));
          this.doesPreviewHaveEmptyMacros = this.checkForEmptyMacrosForPreview();
          return this.$q.when(this.runtimeArguments);
        }
      }
    }, {
      key: "toggleConfig",
      value: function toggleConfig() {
        var _this4 = this;

        this.getRuntimeArguments().then(function () {
          _this4.viewConfig = !_this4.viewConfig;
        });
      }
    }, {
      key: "startOrStopPreview",
      value: function startOrStopPreview() {
        if (this.doesPreviewHaveEmptyMacros) {
          this.doStartOrStopPreview();
        } else {
          // Validate and show runtime arguments if there are
          // un-fulfilled macros.
          this.toggleConfig();
        }
      }
    }, {
      key: "doStartOrStopPreview",
      value: function doStartOrStopPreview() {
        var _this5 = this;

        this.getRuntimeArguments().then(function () {
          if (_this5.previewRunning) {
            _this5.stopPreview();
          } else {
            _this5.onPreviewStart();
          }
        });
      }
    }, {
      key: "toggleScheduler",
      value: function toggleScheduler(e) {
        this.viewScheduler = !this.viewScheduler;
        e.stopPropagation();
      }
    }, {
      key: "applyRuntimeArguments",
      value: function applyRuntimeArguments() {
        var macros = this.HydratorPlusPlusHydratorService.convertRuntimeArgsToMacros(this.runtimeArguments);
        this.macrosMap = macros.macrosMap;
        this.userRuntimeArgumentsMap = macros.userRuntimeArgumentsMap; // have to do this because cannot do two `this.previewStore.dispatch` in a row

        this.previewStore.dispatch(this.previewActions.setMacrosAndUserRuntimeArgs(this.macrosMap, this.userRuntimeArgumentsMap));
        this.previewStore.dispatch(this.previewActions.setRuntimeArgsForDisplay(_.cloneDeep(this.runtimeArguments)));
        this.doesPreviewHaveEmptyMacros = this.checkForEmptyMacrosForPreview();
      }
    }, {
      key: "checkForEmptyMacrosForPreview",
      value: function checkForEmptyMacrosForPreview() {
        return !this.HydratorPlusPlusHydratorService.keyValuePairsHaveMissingValues(this.runtimeArguments);
      }
    }, {
      key: "onPreviewStart",
      value: function onPreviewStart() {
        this._checkAndShowConfirmationModalOnActionPlugin(this.runPreview.bind(this));
      }
    }, {
      key: "runPreview",
      value: function runPreview() {
        var _this6 = this;

        this.previewLoading = true;
        this.loadingLabel = 'Starting';
        this.viewConfig = false;
        this.setDisplayDuration();
        this.updateTimerLabelAndTitle();
        this.currentPreviewId = null;
        this.previewStore.dispatch(this.previewActions.setPreviewId(this.currentPreviewId));
        this.$window.localStorage.removeItem('LastPreviewId', this.currentPreviewId);
        var params = {
          namespace: this.$state.params.namespace,
          scope: this.$scope
        }; // GENERATING PREVIEW CONFIG
        // This might/should be extracted out to a factory

        var pipelineConfig = this.HydratorPlusPlusConfigStore.getConfigForExport();
        /**
         *  This is a cheat way for generating preview for the entire pipeline
         **/

        var macrosWithNonEmptyValues = this.HydratorPlusPlusHydratorService.getMacrosWithNonEmptyValues(this.macrosMap);
        var previewConfig = {
          startStages: [],
          endStages: [],
          runtimeArgs: Object.assign({}, macrosWithNonEmptyValues, this.userRuntimeArgumentsMap)
        };

        if (this.state.artifact.name === this.GLOBALS.etlDataPipeline) {
          pipelineConfig.preview = Object.assign({}, previewConfig, {
            'realDatasets': [],
            'programName': 'DataPipelineWorkflow',
            'programType': 'Workflow'
          });
        } else if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          pipelineConfig.preview = Object.assign({}, previewConfig, {
            'realDatasets': [],
            'programName': 'DataStreamsSparkStreaming',
            'programType': 'Spark',
            'timeout': this.timeoutInMinutes
          });
        } // Get start stages and end stages
        // Current implementation:
        //    - start stages mean sources
        //    - end stages mean sinks


        angular.forEach(pipelineConfig.config.stages, function (node) {
          if (_this6.GLOBALS.pluginConvert[node.plugin.type] === 'source') {
            previewConfig.startStages.push(node.name);
          } else if (_this6.GLOBALS.pluginConvert[node.plugin.type] === 'sink') {
            previewConfig.endStages.push(node.name);
          }
        });
        pipelineConfig.config.preview = previewConfig;

        if (previewConfig.startStages.length === 0 || previewConfig.endStages.length === 0) {
          this.myAlertOnValium.show({
            type: 'danger',
            content: this.GLOBALS.en.hydrator.studio.error.PREVIEW['NO-SOURCE-SINK']
          });
          this.previewLoading = false;
          return;
        }

        this.myPipelineApi.runPreview(params, pipelineConfig).$promise.then(function (res) {
          _this6.previewStore.dispatch(_this6.previewActions.setPreviewId(res.application));

          _this6.setStartTime();

          _this6.startTimer();

          _this6.currentPreviewId = res.application;

          _this6.$window.localStorage.setItem('LastDraftId', _this6.HydratorPlusPlusConfigStore.getDraftId());

          _this6.$window.localStorage.setItem('LastPreviewId', _this6.currentPreviewId);

          _this6.startPollPreviewStatus(res.application);
        }, function (err) {
          _this6.previewLoading = false;

          var errMsg = _this6.myHelpers.extractErrorMessage(err);

          _this6.myAlertOnValium.show({
            type: 'danger',
            content: errMsg
          });
        });
      }
    }, {
      key: "resetButtonsAndStopPoll",
      value: function resetButtonsAndStopPoll() {
        // stop timer, run/stop button, pollId, and stop polling when pipeline is stopped or complete
        this.stopTimer();
        this.previewLoading = false;
        this.previewRunning = false;
        this.dataSrc.stopPoll(this.pollId);
        this.pollId = null;
      }
    }, {
      key: "stopPreview",
      value: function stopPreview() {
        var _this7 = this;

        var silentMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (!this.currentPreviewId || !this.previewRunning || this.loadingLabel === 'Stopping') {
          return;
        }

        var params = {
          namespace: this.$state.params.namespace,
          scope: this.$scope,
          previewId: this.currentPreviewId
        };
        this.previewLoading = true;
        this.loadingLabel = 'Stopping';
        var pipelineName = this.HydratorPlusPlusConfigStore.getName();
        var pipelinePreviewPlaceholder = "The preview of the pipeline".concat(pipelineName.length > 0 ? " \"".concat(pipelineName, "\"") : '');
        this.myPipelineApi.stopPreview(params, {}).$promise.then(function () {
          _this7.resetButtonsAndStopPoll();

          _this7.updateTimerLabelAndTitle();

          if (silentMode) {
            return;
          }

          _this7.myAlertOnValium.show({
            type: 'success',
            content: "".concat(pipelinePreviewPlaceholder, " was stopped.")
          });
        }, function (err) {
          // If error is due to run already having completed, reset UI as if stop succeeded
          if (err.statusCode === 400) {
            _this7.resetButtonsAndStopPoll();

            _this7.updateTimerLabelAndTitle();

            if (silentMode) {
              return;
            }

            _this7.myAlertOnValium.show({
              type: 'success',
              content: "".concat(pipelinePreviewPlaceholder, " was stopped.")
            });

            return;
          } // If backend returns error while stopping, still show preview run button to retry stopping


          _this7.previewLoading = false;
          _this7.previewRunning = true;

          if (silentMode) {
            return;
          }

          _this7.myAlertOnValium.show({
            type: 'danger',
            content: err.data
          });
        });
      }
    }, {
      key: "startPollPreviewStatus",
      value: function startPollPreviewStatus(previewId) {
        var _this8 = this;

        this.previewLoading = false;
        this.previewRunning = true;
        var poll = this.dataSrc.poll({
          _cdapNsPath: '/previews/' + previewId + '/status',
          interval: 1000
        }, function (res) {
          _this8.pollId = res.__pollId__;

          if (_this8.previewStore) {
            _this8.previewStore.dispatch({
              type: _this8.PREVIEWSTORE_ACTIONS.SET_PREVIEW_STATUS,
              payload: {
                status: res.status
              }
            });
          }

          var _window$CaskCommon$PR3 = window.CaskCommon.PREVIEW_STATUS,
              WAITING = _window$CaskCommon$PR3.WAITING,
              ACQUIRED = _window$CaskCommon$PR3.ACQUIRED,
              INIT = _window$CaskCommon$PR3.INIT,
              RUNNING = _window$CaskCommon$PR3.RUNNING,
              COMPLETED = _window$CaskCommon$PR3.COMPLETED,
              DEPLOY_FAILED = _window$CaskCommon$PR3.DEPLOY_FAILED,
              RUN_FAILED = _window$CaskCommon$PR3.RUN_FAILED,
              KILLED_BY_TIMER = _window$CaskCommon$PR3.KILLED_BY_TIMER,
              KILLED_BY_EXCEEDING_MEMORY_LIMIT = _window$CaskCommon$PR3.KILLED_BY_EXCEEDING_MEMORY_LIMIT;

          _this8.updateTimerLabelAndTitle(res);

          if ([RUNNING, INIT, ACQUIRED, WAITING].indexOf(res.status) === -1) {
            _this8.resetButtonsAndStopPoll();

            var pipelineName = _this8.HydratorPlusPlusConfigStore.getName();

            var pipelinePreviewPlaceholder = "The preview of the pipeline".concat(pipelineName.length > 0 ? " \"".concat(pipelineName, "\"") : '');

            if (res.status === COMPLETED || res.status === KILLED_BY_TIMER) {
              _this8.myAlertOnValium.show({
                type: 'success',
                content: "".concat(pipelinePreviewPlaceholder, " has completed successfully.")
              });
            } else {
              var failureMsg = _this8.myHelpers.objectQuery(res, 'throwable', 'message') || "".concat(pipelinePreviewPlaceholder, " has failed. Please check the logs for more information.");

              if (res.status === DEPLOY_FAILED || res.status === KILLED_BY_EXCEEDING_MEMORY_LIMIT) {
                failureMsg = _this8.myHelpers.objectQuery(res, 'throwable', 'message') || 'Unable to run preview. Please try again in sometime.';
              }

              if (res.status === RUN_FAILED) {
                failureMsg = "".concat(pipelinePreviewPlaceholder, " has failed. Please check the logs for more information.");
              }

              _this8.myAlertOnValium.show({
                type: 'danger',
                content: failureMsg
              });
            }
          }
        }, function (err) {
          _this8.stopTimer();

          _this8.updateTimerLabelAndTitle();

          var errorMsg = _this8.myHelpers.extractErrorMessage(err);

          _this8.myAlertOnValium.show({
            type: 'danger',
            content: 'Pipeline preview failed : ' + errorMsg
          });

          _this8.previewRunning = false;

          _this8.dataSrc.stopPoll(poll.__pollId__);

          _this8.pollId = null;
        });
      }
    }, {
      key: "closeLogs",
      value: function closeLogs() {
        this.viewLogs = false;
      }
    }, {
      key: "togglePreviewMode",
      value: function togglePreviewMode() {
        if (this.previewRunning && this.previewMode) {
          this.stopPreview(true);
        }

        this.previewStore.dispatch(this.previewActions.togglePreviewMode(!this.previewMode));
      }
    }, {
      key: "importFile",
      value: function importFile(files) {
        if (!files.length) {
          return;
        }

        var uploadedFile = files[0];
        this.HydratorUpgradeService.validateAndUpgradeConfigFile(uploadedFile);
      }
    }, {
      key: "_checkAndShowConfirmationModalOnDirtyState",
      value: function _checkAndShowConfirmationModalOnDirtyState(proceedCb) {
        var goTonextStep = true;
        var isStoreDirty = this.HydratorPlusPlusConfigStore.getIsStateDirty();

        if (isStoreDirty) {
          return this.$uibModal.open({
            templateUrl: '/assets/features/hydrator/templates/create/popovers/canvas-overwrite-confirmation.html',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            windowTopClass: 'confirm-modal hydrator-modal center',
            controller: ['$scope', 'HydratorPlusPlusConfigStore', 'HydratorPlusPlusConfigActions', function ($scope, HydratorPlusPlusConfigStore, HydratorPlusPlusConfigActions) {
              $scope.isSaving = false;

              $scope.discard = function () {
                goTonextStep = true;

                if (proceedCb) {
                  proceedCb();
                }

                $scope.$close();
              };

              $scope.save = function () {
                var pipelineName = HydratorPlusPlusConfigStore.getName();

                if (!pipelineName.length) {
                  HydratorPlusPlusConfigActions.saveAsDraft();
                  goTonextStep = false;
                  $scope.$close();
                  return;
                }

                var unsub = HydratorPlusPlusConfigStore.registerOnChangeListener(function () {
                  var isStateDirty = HydratorPlusPlusConfigStore.getIsStateDirty(); // This is solely used for showing the spinner icon until the modal is closed.

                  if (!isStateDirty) {
                    unsub();
                    goTonextStep = true;
                    $scope.$close();
                  }
                });
                HydratorPlusPlusConfigActions.saveAsDraft();
                $scope.isSaving = true;
              };

              $scope.cancel = function () {
                $scope.$close();
                goTonextStep = false;
              };
            }]
          }).closed.then(function () {
            return goTonextStep;
          });
        } else {
          if (proceedCb) {
            proceedCb();
          }

          return this.$q.when(goTonextStep);
        }
      }
    }, {
      key: "_checkAndShowConfirmationModalOnActionPlugin",
      value: function _checkAndShowConfirmationModalOnActionPlugin(proceedCb) {
        var isPipelineValid = this.HydratorPlusPlusConfigStore.validateState({
          showConsoleMessage: true,
          validateBeforePreview: true
        });

        if (!isPipelineValid) {
          return;
        }

        var config = this.HydratorPlusPlusConfigStore.getConfigForExport().config;
        var actions = config.stages.filter(function (stage) {
          return stage.plugin.type === 'action';
        });
        var postActions = config.postActions;

        if (actions.length > 0 || postActions.length > 0) {
          this.viewConfig = false;
          var confirmModal = this.$uibModal.open({
            templateUrl: '/assets/features/hydrator/templates/create/popovers/run-preview-action-confirmation-modal.html',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            windowTopClass: 'confirm-modal hydrator-modal center'
          });
          confirmModal.result.then(function (confirm) {
            if (confirm && proceedCb) {
              proceedCb();
            }
          });
        } else {
          if (proceedCb) {
            proceedCb();
          }
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

    return HydratorPlusPlusTopPanelCtrl;
  }();

  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusTopPanelCtrl', HydratorPlusPlusTopPanelCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/detail/canvas-ctrl.js */

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
  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusDetailCanvasCtrl', ["rPipelineDetail", "DAGPlusPlusNodesActionsFactory", "HydratorPlusPlusHydratorService", "DAGPlusPlusNodesStore", "$uibModal", "MyPipelineStatusMapper", "moment", "$interval", "$scope", "myHelpers", function (rPipelineDetail, DAGPlusPlusNodesActionsFactory, HydratorPlusPlusHydratorService, DAGPlusPlusNodesStore, $uibModal, MyPipelineStatusMapper, moment, $interval, $scope, myHelpers) {
    var _this = this;

    this.$uibModal = $uibModal;
    this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
    this.PipelineDetailStore = window.CaskCommon.PipelineDetailStore;
    this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
    this.PipelineMetricsStore = window.CaskCommon.PipelineMetricsStore;
    this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
    this.MyPipelineStatusMapper = MyPipelineStatusMapper;
    this.$interval = $interval;
    this.moment = moment;
    this.currentRunTimeCounter = null;
    this.metrics = {};
    this.logsMetrics = {};

    try {
      rPipelineDetail.config = JSON.parse(rPipelineDetail.configuration);
    } catch (e) {
      console.log('ERROR in configuration from backend: ', e);
      return;
    }

    var globalEvents = window.CaskCommon.globalEvents;
    this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    this.pageLevelError = null;
    this.eventEmitter.on(globalEvents.PAGE_LEVEL_ERROR, function (error) {
      if (error.reset === true) {
        _this.pageLevelError = null;
      } else {
        _this.pageLevelError = myHelpers.handlePageLevelError(error);
      }
    });
    var pipelineConfig = this.PipelineDetailStore.getState().config;
    var nodes = this.HydratorPlusPlusHydratorService.getNodesFromStages(pipelineConfig.stages);
    this.DAGPlusPlusNodesActionsFactory.createGraphFromConfig(nodes, pipelineConfig.connections, pipelineConfig.comments);

    this.updateNodesAndConnections = function () {
      var activeNode = this.DAGPlusPlusNodesStore.getActiveNodeId();

      if (!activeNode) {
        this.deleteNode();
      } else {
        this.setActiveNode();
      }
    };

    this.setActiveNode = function () {
      var nodeId = this.DAGPlusPlusNodesStore.getActiveNodeId();

      if (!nodeId) {
        return;
      }

      var pluginNode = nodes.find(function (node) {
        return node.name === nodeId;
      });
      this.$uibModal.open({
        windowTemplateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/popover-template.html',
        templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/popover.html',
        size: 'lg',
        backdrop: 'static',
        windowTopClass: 'node-config-modal hydrator-modal',
        controller: 'HydratorPlusPlusNodeConfigCtrl',
        controllerAs: 'HydratorPlusPlusNodeConfigCtrl',
        resolve: {
          rIsStudioMode: function rIsStudioMode() {
            return false;
          },
          rDisabled: function rDisabled() {
            return true;
          },
          rNodeMetricsContext: ["$stateParams", "GLOBALS", function rNodeMetricsContext($stateParams, GLOBALS) {
            'ngInject';

            var pipelineDetailStoreState = window.CaskCommon.PipelineDetailStore.getState();
            var programType = pipelineDetailStoreState.artifact.name === GLOBALS.etlDataPipeline ? 'workflow' : 'spark';
            var programId = pipelineDetailStoreState.artifact.name === GLOBALS.etlDataPipeline ? 'DataPipelineWorkflow' : 'DataStreamsSparkStreaming';
            return {
              runRecord: pipelineDetailStoreState.currentRun,
              runs: pipelineDetailStoreState.runs,
              namespace: $stateParams.namespace,
              app: pipelineDetailStoreState.name,
              programType: programType,
              programId: programId
            };
          }],
          rPlugin: ["HydratorPlusPlusHydratorService", function rPlugin(HydratorPlusPlusHydratorService) {
            'ngInject';

            var pluginId = pluginNode.name;
            var pipelineDetailStoreState = window.CaskCommon.PipelineDetailStore.getState();
            var appType = pipelineDetailStoreState.artifact.name;
            var sourceConnections = pipelineDetailStoreState.config.connections.filter(function (conn) {
              return conn.to === pluginId;
            });
            var nodes = HydratorPlusPlusHydratorService.getNodesFromStages(pipelineDetailStoreState.config.stages);
            var nodesMap = HydratorPlusPlusHydratorService.getNodesMap(nodes);
            var sourceNodes = sourceConnections.map(function (conn) {
              return nodesMap[conn.from];
            });
            var artifactVersion = pipelineDetailStoreState.artifact.version;
            return {
              pluginNode: pluginNode,
              appType: appType,
              sourceConnections: sourceConnections,
              sourceNodes: sourceNodes,
              artifactVersion: artifactVersion
            };
          }]
        }
      }).result.then(this.deleteNode.bind(this), this.deleteNode.bind(this)); // Both close and ESC events in the modal are considered as SUCCESS and ERROR in promise callback. Hence the same callback for both success & failure.
    };

    this.deleteNode = function () {
      _this.DAGPlusPlusNodesActionsFactory.resetSelectedNode();
    };

    function convertMetricsArrayIntoObject(arr) {
      var obj = {};
      angular.forEach(arr, function (item) {
        obj[item.nodeName] = {
          recordsOut: item.recordsOut,
          recordsIn: item.recordsIn,
          recordsError: item.recordsError
        };
      });
      return obj;
    }

    this.pipelineMetricsStoreSubscription = this.PipelineMetricsStore.subscribe(function () {
      _this.metrics = convertMetricsArrayIntoObject(_this.PipelineMetricsStore.getState().metrics);
      _this.logsMetrics = _this.PipelineMetricsStore.getState().logsMetrics; // Not sure why sometimes digest cycles are not kicked off, even though the above values have changed
      // Use $evalAsync here to make sure a digest cycle is kicked off.
      // 'Safe' way to $apply, similar to $timeout
      // https://www.panda-os.com/blog/2015/01/angularjs-apply-digest-and-evalasync/

      $scope.$evalAsync();
    });
    this.pipelineDetailStoreSubscription = this.PipelineDetailStore.subscribe(function () {
      var pipelineDetailStoreState = _this.PipelineDetailStore.getState();

      var runs = pipelineDetailStoreState.runs;

      if (runs.length) {
        _this.currentRun = pipelineDetailStoreState.currentRun;

        if (_.isEmpty(_this.currentRun)) {
          _this.currentRun = runs[0];
        }

        var status = _this.MyPipelineStatusMapper.lookupDisplayStatus(_this.currentRun.status);

        _this.$interval.cancel(_this.currentRunTimeCounter);

        if (status === 'Running') {
          _this.currentRunTimeCounter = _this.$interval(function () {
            var duration = window.CaskCommon.CDAPHelpers.humanReadableDuration(Math.floor(Date.now() / 1000) - _this.currentRun.starting);
            _this.currentRun = Object.assign({}, _this.currentRun, {
              duration: duration
            });
          }, 1000);
        }

        var timeDifference = _this.currentRun.end ? _this.currentRun.end - _this.currentRun.starting : Math.floor(Date.now() / 1000) - _this.currentRun.starting;
        _this.currentRun = Object.assign({}, _this.currentRun, {
          duration: window.CaskCommon.CDAPHelpers.humanReadableDuration(timeDifference),
          startTime: _this.currentRun.start ? _this.moment(_this.currentRun.start * 1000).format('hh:mm:ss a') : null,
          starting: !_this.currentRun.starting ? _this.moment(_this.currentRun.starting * 1000).format('hh:mm:ss a') : null,
          statusCssClass: _this.MyPipelineStatusMapper.getStatusIndicatorClass(status),
          status: status
        });
        var reversedRuns = window.CaskCommon.CDAPHelpers.reverseArrayWithoutMutating(runs);

        var runNumber = _.findIndex(reversedRuns, {
          runid: _this.currentRun.runid
        });

        _this.currentRunIndex = runNumber + 1;
        _this.totalRuns = runs.length;
      }
    });
    DAGPlusPlusNodesStore.registerOnChangeListener(this.setActiveNode.bind(this));
    $scope.$on('$destroy', function () {
      _this.pipelineMetricsStoreSubscription();

      _this.pipelineDetailStoreSubscription();
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
  /* /controllers/create/partials/console-tab-ctrl.js */

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
  var HydratorPlusPlusConsoleTabService = /*#__PURE__*/function () {
    HydratorPlusPlusConsoleTabService.$inject = ["HydratorPlusPlusConsoleStore", "myAlertOnValium"];
    function HydratorPlusPlusConsoleTabService(HydratorPlusPlusConsoleStore, myAlertOnValium) {
      _classCallCheck(this, HydratorPlusPlusConsoleTabService);

      this.HydratorPlusPlusConsoleStore = HydratorPlusPlusConsoleStore;
      this.myAlertOnValium = myAlertOnValium;
      this.setMessages();
    }

    _createClass(HydratorPlusPlusConsoleTabService, [{
      key: "listen",
      value: function listen() {
        this.unsub = this.HydratorPlusPlusConsoleStore.registerOnChangeListener(this.setMessages.bind(this));
      }
    }, {
      key: "unsubscribe",
      value: function unsubscribe() {
        this.unsub();
      }
    }, {
      key: "setMessages",
      value: function setMessages() {
        var messages = this.HydratorPlusPlusConsoleStore.getMessages();

        if (Array.isArray(messages) && !messages.length) {
          return;
        }

        var missingNodesList = [];
        var errorMessage = [];
        var successMessage = [];
        messages.forEach(function (message) {
          switch (message.type) {
            case 'NO-SINK-FOUND':
              missingNodesList.push('sinks(s)');
              break;

            case 'NO-SOURCE-FOUND':
              missingNodesList.push('source(s)');
              break;

            case 'STRAY-NODES':
              errorMessage.push(message.payload.nodes.map(function (node) {
                return node.plugin.label;
              }).join(', ') + ' - nodes missing connections');
              break;

            case 'INVALID-CONNECTIONS':
              errorMessage.push(message.payload.connections.join(', ') + ' - invalid connection');
              break;

            case 'NO-BACKEND-PROPS':
              {
                var multiplePlugins = message.payload.nodes.length > 1;
                var suffix = multiplePlugins ? 's' : '';
                var pluginNames = message.payload.nodes.join(', ');
                var messageStr = "Artifact".concat(suffix, " ").concat(pluginNames, " ").concat(multiplePlugins ? 'are' : 'is', " not available.");
                errorMessage.push(messageStr);
                break;
              }

            case 'success':
              successMessage.push(message.content);
              break;

            case 'error':
              errorMessage.push(message.content);
              break;
          }
        });

        if (missingNodesList.length === 2) {
          errorMessage.push("Missing ".concat(missingNodesList.join(', '), " or actions in the pipeline."));
        } else if (missingNodesList.length) {
          errorMessage.push("Missing ".concat(missingNodesList.join(', '), " in the pipeline."));
        }

        if (successMessage.length) {
          this.myAlertOnValium.show({
            type: 'success',
            content: successMessage.join(', ')
          });
        } else if (errorMessage.length) {
          this.myAlertOnValium.show({
            type: 'danger',
            templateUrl: '/assets/features/hydrator/templates/partial/error-template.html',
            templateScope: {
              content: errorMessage,
              currentIndex: 0,
              moveToNextIndex: function moveToNextIndex() {
                if (errorMessage.length > this.currentIndex) {
                  this.currentIndex += 1;
                }
              },
              moveToPrevIndex: function moveToPrevIndex() {
                if (this.currentIndex > 0) {
                  this.currentIndex -= 1;
                }
              }
            }
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

    return HydratorPlusPlusConsoleTabService;
  }();

  HydratorPlusPlusConsoleTabService.$inject = ['HydratorPlusPlusConsoleStore', 'myAlertOnValium'];
  angular.module(PKG.name + '.feature.hydrator').service('HydratorPlusPlusConsoleTabService', HydratorPlusPlusConsoleTabService);
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
  /* /controllers/create/partials/nodeconfig-ctrl.js */

  /*
   * Copyright © 2015-2019 Cask Data, Inc.
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
  var HydratorPlusPlusNodeConfigCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusNodeConfigCtrl.$inject = ["$scope", "$timeout", "$state", "HydratorPlusPlusPluginConfigFactory", "EventPipe", "GLOBALS", "HydratorPlusPlusConfigActions", "myHelpers", "NonStorePipelineErrorFactory", "$uibModal", "HydratorPlusPlusConfigStore", "rPlugin", "rDisabled", "HydratorPlusPlusHydratorService", "myPipelineApi", "HydratorPlusPlusPreviewStore", "rIsStudioMode", "HydratorPlusPlusOrderingFactory", "avsc", "DAGPlusPlusNodesActionsFactory", "rNodeMetricsContext", "HydratorPlusPlusNodeService", "HydratorPlusPlusPreviewActions", "myAlertOnValium", "HydratorPlusPlusCanvasFactory"];
    function HydratorPlusPlusNodeConfigCtrl($scope, $timeout, $state, HydratorPlusPlusPluginConfigFactory, EventPipe, GLOBALS, HydratorPlusPlusConfigActions, myHelpers, NonStorePipelineErrorFactory, $uibModal, HydratorPlusPlusConfigStore, rPlugin, rDisabled, HydratorPlusPlusHydratorService, myPipelineApi, HydratorPlusPlusPreviewStore, rIsStudioMode, HydratorPlusPlusOrderingFactory, avsc, DAGPlusPlusNodesActionsFactory, rNodeMetricsContext, HydratorPlusPlusNodeService, HydratorPlusPlusPreviewActions, myAlertOnValium, HydratorPlusPlusCanvasFactory) {
      'ngInject';

      var _this = this;

      _classCallCheck(this, HydratorPlusPlusNodeConfigCtrl);

      this.$scope = $scope;
      this.$timeout = $timeout;
      this.$state = $state;
      this.EventPipe = EventPipe;
      this.HydratorPlusPlusPluginConfigFactory = HydratorPlusPlusPluginConfigFactory;
      this.GLOBALS = GLOBALS;
      this.myHelpers = myHelpers;
      this.HydratorPlusPlusConfigActions = HydratorPlusPlusConfigActions;
      this.NonStorePipelineErrorFactory = NonStorePipelineErrorFactory;
      this.requiredPropertyError = this.GLOBALS.en.hydrator.studio.error['GENERIC-MISSING-REQUIRED-FIELDS'];
      this.showPropagateConfirm = false; // confirmation dialog in node config for schema propagation.

      this.$uibModal = $uibModal;
      this.ConfigStore = HydratorPlusPlusConfigStore;
      this.$scope.isDisabled = rDisabled;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.myPipelineApi = myPipelineApi;
      this.previewStore = HydratorPlusPlusPreviewStore;
      this.HydratorPlusPlusPreviewActions = HydratorPlusPlusPreviewActions;
      this.HydratorPlusPlusOrderingFactory = HydratorPlusPlusOrderingFactory;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.avsc = avsc;
      this.PipelineMetricsStore = window.CaskCommon.PipelineMetricsStore;
      this.HydratorPlusPlusNodeService = HydratorPlusPlusNodeService;
      this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
      this.configurationGroupUtilities = window.CaskCommon.ConfigurationGroupUtilities;
      this.dynamicFiltersUtilities = window.CaskCommon.DynamicFiltersUtilities;
      this.showNewSchemaEditor = window.localStorage['schema-editor'] === 'true';
      this.myAlertOnValium = myAlertOnValium;
      this.metricsContext = rNodeMetricsContext;
      this.isStudioMode = rIsStudioMode;
      this.rPlugin = rPlugin;
      this.HydratorPlusPlusCanvasFactory = HydratorPlusPlusCanvasFactory;
      this.validatePluginProperties = this.validatePluginProperties.bind(this);
      this.getPreviewId = this.getPreviewId.bind(this);
      this.previewId = this.getPreviewId();
      this.previewStatus = null;
      this.getStagesAndConnections = this.getStagesAndConnections.bind(this);
      this.getIsMacroEnabled = this.getIsMacroEnabled.bind(this);
      this.onImportSchema = this.onImportSchema.bind(this);
      this.onClearSchema = this.onClearSchema.bind(this);
      this.onPropagateSchema = this.onPropagateSchema.bind(this);
      this.onMacroEnabled = this.onMacroEnabled.bind(this);
      this.onSchemaChange = this.onSchemaChange.bind(this);
      this.onSchemaImportLinkClick = this.onSchemaImportLinkClick.bind(this);
      this.isSchemaMacro = this.isSchemaMacro.bind(this);
      this.onPropertiesChange = this.onPropertiesChange.bind(this);
      this.handleLabelChange = this.handleLabelChange.bind(this);
      this.initializeMetrics = this.initializeMetrics.bind(this);
      this.showContents = this.showContents.bind(this);
      this.initializePreview = this.initializePreview.bind(this);
      this.setComments = this.setComments.bind(this);
      this.tabs = [{
        label: 'Properties',
        templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/configuration-tab.html'
      }, {
        label: 'Preview',
        templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/preview-tab.html'
      }, {
        label: 'Documentation',
        templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/reference-tab.html'
      }, {
        label: 'Metrics',
        templateUrl: '/assets/features/hydrator/templates/partial/node-config-modal/metrics-tab.html'
      }];
      this.setDefaults();
      this.fetchPluginInfo(rPlugin).then(this.initializeMetrics).then(this.showContents).then(this.initializePreview);
      this.portMetricsToShow = this.PipelineMetricsStore.getState().portsToShow;
      this.$scope.$on('modal.closing', function () {
        _this.updateNodeStateIfDirty();

        _this.previewStore.dispatch(_this.HydratorPlusPlusPreviewActions.resetPreviewData());
      }); // Timeouts

      this.setStateTimeout = null;
      this.eventEmitter.on('dataset.selected', this.handleDatasetSelected.bind(this));
      this.$scope.$on('$destroy', function () {
        _this.$timeout.cancel(_this.setStateTimeout);

        _this.eventEmitter.off('dataset.selected', _this.handleDatasetSelected.bind(_this));
      });
      this.labelConfig = {
        widgetProperty: {
          label: 'Label',
          'widget-type': 'textbox'
        },
        pluginProperty: {
          required: true
        }
      };
    }

    _createClass(HydratorPlusPlusNodeConfigCtrl, [{
      key: "fetchPluginInfo",
      value: function fetchPluginInfo(rPlugin) {
        var _this2 = this;

        var pluginNode = rPlugin.pluginNode;
        var appType = rPlugin.appType;
        var sourceConnections = rPlugin.sourceConnections;
        var sourceNodes = rPlugin.sourceNodes;
        var artifactVersion = rPlugin.artifactVersion;
        return this.HydratorPlusPlusNodeService.getPluginInfo(pluginNode, appType, sourceConnections, sourceNodes, artifactVersion).then(function (nodeWithInfo) {
          var pluginType = nodeWithInfo.type || nodeWithInfo.plugin.type;
          return _this2.setDefaults({
            node: nodeWithInfo,
            isValidPlugin: true,
            type: appType,
            isSource: _this2.GLOBALS.pluginConvert[pluginType] === 'source',
            isSink: _this2.GLOBALS.pluginConvert[pluginType] === 'sink',
            isTransform: _this2.GLOBALS.pluginConvert[pluginType] === 'transform',
            isAction: _this2.GLOBALS.pluginConvert[pluginType] === 'action',
            isCondition: _this2.GLOBALS.pluginConvert[pluginType] === 'condition'
          });
        }, function (err) {
          if (err && err.statusCode === 404) {
            // This is when plugin artifact is unavailable. Show appropriate message.
            _this2.state.configfetched = true;
            _this2.state.noproperty = 0;
            _this2.state.isValidPlugin = false;
          }
        });
      }
    }, {
      key: "setDefaults",
      value: function setDefaults() {
        var _this3 = this;

        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.state = {
          configfetched: false,
          properties: [],
          noconfig: null,
          noproperty: true,
          config: {},
          groupsConfig: {},
          isValidPlugin: config.isValidPlugin || false,
          node: angular.copy(config.node) || {},
          isSource: config.isSource || false,
          isSink: config.isSink || false,
          isTransform: config.isTransform || false,
          isAction: config.isAction || false,
          isCondition: config.isCondition || false,
          type: config.appType || null,
          watchers: [],
          outputSchemaUpdate: 0,
          schemaAdvance: false
        };
        this.isPreviewMode = this.previewStore.getState().preview.isPreviewModeEnabled;
        this.isPreviewData = this.previewStore.getState().preview.previewData;
        this.activeTab = 1;

        if (this.isPreviewMode && this.isPreviewData && !this.rPlugin.isAction) {
          this.activeTab = 2;
        } else if (this.PipelineMetricsStore.getState().metricsTabActive) {
          this.activeTab = 4;
        }

        this.defaultState = angular.copy(this.state);
        var propertiesSchema = this.myHelpers.objectQuery(this.state.node, 'plugin', 'properties', 'schema');
        var schemaArr = propertiesSchema || this.state.node.outputSchema;

        if (schemaArr) {
          if (Array.isArray(schemaArr)) {
            angular.forEach(schemaArr, function (schemaObj) {
              if (schemaObj.schema) {
                try {
                  _this3.avsc.parse(schemaObj.schema, {
                    wrapUnions: true
                  });
                } catch (e) {
                  // If its old schema editor by default set it to advance
                  if (!_this3.showNewSchemaEditor) {
                    _this3.state.schemaAdvance = true;
                  } else {
                    // else if its a new schema editor set advance only if the schema is a macro.
                    if (schemaArr.indexOf('${') !== -1) {
                      _this3.state.schemaAdvance = true;
                    }
                  }
                }
              }
            });
          } else {
            try {
              this.avsc.parse(schemaArr, {
                wrapUnions: true
              });
            } catch (e) {
              // If its old schema editor by default set it to advance
              if (!this.showNewSchemaEditor) {
                this.state.schemaAdvance = true;
              } else {
                // else if its a new schema editor set advance only if the schema is a macro.
                if (schemaArr.indexOf('${') !== -1) {
                  this.state.schemaAdvance = true;
                }
              }
            }
          }
        }

        this.showPropagateConfirm = false;
      }
    }, {
      key: "initializeMetrics",
      value: function initializeMetrics() {
        var _this4 = this;

        this.isMetricsEnabled = this.$scope.isDisabled && Array.isArray(this.metricsContext.runs) && this.metricsContext.runs.length;

        if (this.metricsContext) {
          this.nodeMetrics = ["user.".concat(this.state.node.name, ".records.in"), "user.".concat(this.state.node.name, ".records.error"), "user.".concat(this.state.node.name, ".process.time.total"), "user.".concat(this.state.node.name, ".process.time.avg"), "user.".concat(this.state.node.name, ".process.time.max"), "user.".concat(this.state.node.name, ".process.time.min"), "user.".concat(this.state.node.name, ".process.time.stddev")];
          var nodeType = this.state.node.type || this.state.node.plugin.type;

          if (nodeType === 'splittertransform') {
            if (this.state.node.outputSchema && Array.isArray(this.state.node.outputSchema)) {
              angular.forEach(this.state.node.outputSchema, function (port) {
                _this4.nodeMetrics.push("user.".concat(_this4.state.node.name, ".records.out.").concat(port.name));
              });
            }
          } else {
            this.nodeMetrics.push("user.".concat(this.state.node.name, ".records.out"));
          }
        } else {
          this.nodeMetrics = [];
        }
      }
    }, {
      key: "initializePreview",
      value: function initializePreview() {
        if (this.isStudioMode && this.isPreviewMode && this.previewId) {
          this.previewData = null;
          this.updatePreviewStatus();
          this.selectedNode = {
            nodeType: this.state.node.type,
            name: this.state.node.plugin.label,
            plugin: this.state.node.plugin,
            isSource: this.state.isSource,
            isSink: this.state.isSink,
            isCondition: this.state.isCondition
          };
        }
      }
    }, {
      key: "handleDatasetSelected",
      value: function handleDatasetSelected(schema, format, datasetAlreadyExists, datasetId) {
        if (datasetAlreadyExists) {
          this.datasetAlreadyExists = datasetAlreadyExists;
        } else {
          this.datasetAlreadyExists = false;
        } // if this plugin is having an existing dataset with a macro, then don't change anything.
        // else if the user is changing to another existing dataset, then show basic mode.


        if (this.myHelpers.objectQuery(this, 'defaultState', 'node', 'plugin', 'properties', 'name') && this.defaultState.node.plugin.properties.name !== datasetId) {
          this.state.schemaAdvance = false;
        }

        if (datasetId) {
          this.datasetId = datasetId;
        }
      }
    }, {
      key: "onPropertiesChange",
      value: function onPropertiesChange() {
        var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.state.node.plugin.properties = values;
      }
    }, {
      key: "handleLabelChange",
      value: function handleLabelChange(value) {
        this.state.node.plugin.label = value;
      }
    }, {
      key: "showContents",
      value: function showContents() {
        var _this5 = this;

        if (angular.isArray(this.state.watchers)) {
          this.state.watchers.forEach(function (watcher) {
            return watcher();
          });
          this.state.watchers = [];
        }

        if (Object.keys(this.state.node).length) {
          this.configfetched = false;
          this.$timeout.cancel(this.setStateTimeout);
          this.setStateTimeout = this.$timeout(function () {
            _this5.loadNewPlugin();

            _this5.validateNodeLabel();
          });
        }
      }
    }, {
      key: "validateNodeLabel",
      value: function validateNodeLabel() {
        var _this6 = this;

        var nodes = this.ConfigStore.getNodes();
        var nodeName = this.myHelpers.objectQuery(this.state, 'node', 'plugin', 'label');

        if (!nodeName) {
          return;
        }

        this.NonStorePipelineErrorFactory.isNodeNameUnique(nodeName, nodes, function (err) {
          if (err) {
            _this6.state.nodeLabelError = _this6.GLOBALS.en.hydrator.studio.error[err];
          } else {
            _this6.state.nodeLabelError = '';
          }
        });
      }
    }, {
      key: "propagateSchemaDownStream",
      value: function propagateSchemaDownStream() {
        this.HydratorPlusPlusConfigActions.propagateSchemaDownStream(this.state.node.name);
      }
    }, {
      key: "loadNewPlugin",
      value: function loadNewPlugin() {
        var _this7 = this;

        var noJsonErrorHandler = function noJsonErrorHandler(err) {
          var propertiesFromBackend = Object.keys(_this7.state.node._backendProperties); // Didn't receive a configuration from the backend. Fallback to all textboxes.

          switch (err) {
            case 'NO_JSON_FOUND':
              _this7.state.noConfigMessage = _this7.GLOBALS.en.hydrator.studio.info['NO-CONFIG'];
              break;

            case 'CONFIG_SYNTAX_JSON_ERROR':
              _this7.state.noConfigMessage = _this7.GLOBALS.en.hydrator.studio.error['SYNTAX-CONFIG-JSON'];
              break;

            case 'CONFIG_SEMANTICS_JSON_ERROR':
              _this7.state.noConfigMessage = _this7.GLOBALS.en.hydrator.studio.error['SEMANTIC-CONFIG-JSON'];
              break;
          }

          _this7.state.noconfig = true;
          _this7.state.configfetched = true;
          propertiesFromBackend.forEach(function (property) {
            _this7.state.node.plugin.properties[property] = _this7.state.node.plugin.properties[property] || '';
          });
          _this7.defaultState = angular.copy(_this7.state);

          _this7.state.watchers.push(_this7.$scope.$watch('HydratorPlusPlusNodeConfigCtrl.state.node', function () {
            _this7.validateNodeLabel(_this7);

            _this7.HydratorPlusPlusConfigActions.editPlugin(_this7.state.node.name, _this7.state.node);
          }, true));
        };

        this.state.noproperty = Object.keys(this.state.node._backendProperties || {}).length;

        if (this.state.noproperty) {
          var artifactName = this.myHelpers.objectQuery(this.state.node, 'plugin', 'artifact', 'name');
          var artifactVersion = this.myHelpers.objectQuery(this.state.node, 'plugin', 'artifact', 'version');
          var artifactScope = this.myHelpers.objectQuery(this.state.node, 'plugin', 'artifact', 'scope');
          this.HydratorPlusPlusPluginConfigFactory.fetchWidgetJson(artifactName, artifactVersion, artifactScope, "widgets.".concat(this.state.node.plugin.name, "-").concat(this.state.node.type || this.state.node.plugin.type)).then(function (res) {
            _this7.widgetJson = res; // Not going to eliminate the groupsConfig just yet, because there are still other things depending on it
            // such as output schema.

            try {
              _this7.state.groupsConfig = _this7.HydratorPlusPlusPluginConfigFactory.generateNodeConfig(_this7.state.node._backendProperties, res);
            } catch (e) {
              noJsonErrorHandler();
              return;
            }

            var generateJumpConfig = function generateJumpConfig(jumpConfig, properties) {
              var datasets = [];
              var jumpConfigDatasets = jumpConfig.datasets || [];
              datasets = jumpConfigDatasets.map(function (dataset) {
                return {
                  datasetId: properties[dataset['ref-property-name']],
                  entityType: 'datasets'
                };
              });
              return {
                datasets: datasets
              };
            };

            if (res.errorDataset || _this7.state.node.errorDatasetName) {
              _this7.state.showErrorDataset = true;
              _this7.state.errorDatasetTooltip = res.errorDataset && res.errorDataset.errorDatasetTooltip || false;
              _this7.state.node.errorDatasetName = _this7.state.node.errorDatasetName || '';
            }

            if (_this7.$scope.isDisabled && _this7.state.groupsConfig.jumpConfig && Object.keys(_this7.state.groupsConfig.jumpConfig).length) {
              var _generateJumpConfig = generateJumpConfig(_this7.state.groupsConfig.jumpConfig, _this7.state.node.plugin.properties),
                  datasets = _generateJumpConfig.datasets;

              _this7.state.groupsConfig.jumpConfig.datasets = datasets;
            } else {
              // If we isDisabled is set to false then we are in studio mode & hence remove jump config.
              // Jumpconfig is only for published view where everything is disabled.
              delete _this7.state.groupsConfig.jumpConfig;
            }

            var configOutputSchema = _this7.state.groupsConfig.outputSchema; // If its an implicit schema, set the output schema to the implicit schema and inform ConfigActionFactory

            if (configOutputSchema.implicitSchema) {
              _this7.state.node.outputSchema = [_this7.HydratorPlusPlusNodeService.getOutputSchemaObj(_this7.HydratorPlusPlusHydratorService.formatSchemaToAvro(configOutputSchema.implicitSchema))];

              _this7.HydratorPlusPlusConfigActions.editPlugin(_this7.state.node.name, _this7.state.node);
            } else {
              // If not an implcit schema check if a schema property exists in the node config.
              // What this means is, has the plugin developer specified a plugin property in 'outputs' array of node config.
              // If yes then set it as output schema and everytime when a user edits the output schema the value has to
              // be transitioned to the respective plugin property.
              if (configOutputSchema.isOutputSchemaExists) {
                var schemaProperty = configOutputSchema.outputSchemaProperty[0];
                var pluginProperties = _this7.state.node.plugin.properties;

                if (pluginProperties[schemaProperty]) {
                  _this7.state.node.outputSchema = pluginProperties[schemaProperty];
                } else if (pluginProperties[schemaProperty] !== _this7.state.node.outputSchema) {
                  _this7.state.node.plugin.properties[configOutputSchema.outputSchemaProperty[0]] = _this7.state.node.outputSchema[0].schema;
                }

                _this7.state.watchers.push(_this7.$scope.$watch('HydratorPlusPlusNodeConfigCtrl.state.node.outputSchema', function () {
                  if (_this7.validateSchema()) {
                    _this7.state.node.plugin.properties[configOutputSchema.outputSchemaProperty[0]] = _this7.state.node.outputSchema[0].schema;
                  }
                }));
              }
            }

            if (!_this7.$scope.isDisabled) {
              _this7.state.watchers.push(_this7.$scope.$watch('HydratorPlusPlusNodeConfigCtrl.state.node', function () {
                _this7.validateNodeLabel(_this7);

                _this7.HydratorPlusPlusConfigActions.editPlugin(_this7.state.node.name, _this7.state.node);
              }, true));
            }

            if (!_this7.state.node.outputSchema || _this7.state.node.type === 'condition') {
              var inputSchema = _this7.myHelpers.objectQuery(_this7.state.node, 'inputSchema', 0, 'schema') || '';

              if (typeof inputSchema !== 'string') {
                inputSchema = JSON.stringify(inputSchema);
              }

              _this7.state.node.outputSchema = [_this7.HydratorPlusPlusNodeService.getOutputSchemaObj(inputSchema)];
            }

            if (!_this7.state.node.plugin.label) {
              _this7.state.node.plugin.label = _this7.state.node.name;
            } // Mark the configfetched to show that configurations have been received.


            _this7.state.configfetched = true;
            _this7.state.config = res;
            _this7.state.noconfig = false;
            _this7.defaultState = angular.copy(_this7.state);
          }, noJsonErrorHandler);
        } else {
          this.state.configfetched = true;
        }
      }
    }, {
      key: "schemaClear",
      value: function schemaClear() {
        this.eventEmitter.emit('schema.clear');
      }
    }, {
      key: "importFiles",
      value: function importFiles(files) {
        var _this8 = this;

        var reader = new FileReader();
        reader.readAsText(files[0], 'UTF-8');

        reader.onload = function (evt) {
          var data = evt.target.result;

          _this8.eventEmitter.emit('schema.import', data);
        };
      }
    }, {
      key: "onSchemaImportLinkClick",
      value: function onSchemaImportLinkClick() {
        this.$timeout(function () {
          return document.getElementById('schema-import-link').click();
        });
      }
    }, {
      key: "exportSchema",
      value: function exportSchema() {
        this.eventEmitter.emit('schema.export');
      }
    }, {
      key: "validateSchema",
      value: function validateSchema() {
        var _this9 = this;

        this.state.errors = [];

        if (!Array.isArray(this.state.node.outputSchema)) {
          this.state.node.outputSchema = [this.HydratorPlusPlusNodeService.getOutputSchemaObj(this.state.node.outputSchema)];
        }

        angular.forEach(this.state.node.outputSchema, function (schemaObj) {
          var schema;

          try {
            schema = JSON.parse(schemaObj.schema);
            schema = schema.fields;
          } catch (e) {
            schema = null;
          }

          var validationRules = [_this9.hasUniqueFields];
          var error = [];
          validationRules.forEach(function (rule) {
            rule.call(this, schema, error);
          });

          if (error.length > 0) {
            _this9.state.errors.push(error);
          }
        });

        if (this.state.errors.length) {
          return false;
        }

        return true;
      }
    }, {
      key: "validatePluginProperties",
      value: function validatePluginProperties(callback, validationFromGetSchema) {
        var nodeInfo = this.HydratorPlusPlusCanvasFactory.pruneProperties({
          stages: [angular.copy(this.state.node)]
        }).stages[0];
        var vm = this;
        vm.propertyErrors = {};
        vm.inputSchemaErrors = {};
        vm.outputSchemaErrors = {};

        if (!validationFromGetSchema) {
          vm.validating = true;
          vm.errorCount = undefined;
        }

        var errorCb = function errorCb(_ref) {
          var errorCount = _ref.errorCount,
              propertyErrors = _ref.propertyErrors,
              inputSchemaErrors = _ref.inputSchemaErrors,
              outputSchemaErrors = _ref.outputSchemaErrors;
          // errorCount can be 0, a positive integer, or undefined (in case of an error thrown)
          vm.validating = false;
          vm.errorCount = errorCount;

          if (errorCount > 0) {
            vm.propertyErrors = propertyErrors;
            vm.inputSchemaErrors = inputSchemaErrors;
            vm.outputSchemaErrors = outputSchemaErrors;
          } else if (errorCount === 0) {
            // Empty existing errors
            vm.propertyErrors = {};
            vm.inputSchemaErrors = {};
            vm.outputSchemaErrors = {}; // Do not show success validation message for validation via get schema.

            if (validationFromGetSchema === true) {
              vm.errorCount = undefined;
            }
          } else {
            vm.propertyErrors = propertyErrors;
          }

          if (callback && typeof callback === 'function') {
            callback();
          }
        };

        this.HydratorPlusPlusPluginConfigFactory.validatePluginProperties(nodeInfo, this.state.config, errorCb, validationFromGetSchema);
      } // MACRO ENABLED SCHEMA

    }, {
      key: "toggleAdvance",
      value: function toggleAdvance() {
        if (this.state.node.outputSchema.length > 0) {
          try {
            this.avsc.parse(this.state.node.outputSchema[0].schema, {
              wrapUnions: true
            });
          } catch (e) {
            this.state.node.outputSchema = [this.HydratorPlusPlusNodeService.getOutputSchemaObj('')];
          }
        }

        this.state.schemaAdvance = !this.state.schemaAdvance;
      }
    }, {
      key: "hasUniqueFields",
      value: function hasUniqueFields(schema, error) {
        if (!schema) {
          return true;
        }

        var fields = schema.map(function (field) {
          return field.name;
        });

        var unique = _.uniq(fields);

        if (fields.length !== unique.length) {
          error.push('There are two or more fields with the same name.');
        }
      }
    }, {
      key: "updateNodeStateIfDirty",
      value: function updateNodeStateIfDirty() {
        var stateIsDirty = this.stateIsDirty(); // because we are adding state to history before we open a node config, so if the config wasn't changed at all,
        // then we should remove that state from history

        if (!stateIsDirty) {
          this.DAGPlusPlusNodesActionsFactory.removePreviousState(); // if it was changed, then reset future states so user can't redo
        } else {
          this.DAGPlusPlusNodesActionsFactory.resetFutureStates();
        }
      }
    }, {
      key: "stateIsDirty",
      value: function stateIsDirty() {
        var defaults = this.defaultState.node;
        var state = this.state.node;
        return !angular.equals(defaults, state);
      }
    }, {
      key: "updateDefaultOutputSchema",
      value: function updateDefaultOutputSchema(outputSchema) {
        if (typeof outputSchema !== 'string') {
          outputSchema = JSON.stringify(outputSchema);
        }

        var configOutputSchema = this.state.groupsConfig.outputSchema;

        if (!configOutputSchema.implicitSchema && configOutputSchema.isOutputSchemaExists) {
          this.defaultState.node.outputSchema = outputSchema;
          this.defaultState.node.plugin.properties[configOutputSchema.outputSchemaProperty[0]] = this.defaultState.node.outputSchema;
        }
      }
    }, {
      key: "updatePreviewDataAndStatus",
      value: function updatePreviewDataAndStatus(newPreviewData) {
        this.updatePreviewStatus();
        this.previewData = newPreviewData;
      }
    }, {
      key: "updatePreviewStatus",
      value: function updatePreviewStatus() {
        var previewState = this.previewStore.getState().preview;

        if (previewState.status) {
          this.previewStatus = previewState.status;
        }
      }
    }, {
      key: "getPreviewId",
      value: function getPreviewId() {
        return this.previewStore.getState().preview.previewId;
      }
    }, {
      key: "getStagesAndConnections",
      value: function getStagesAndConnections() {
        return this.ConfigStore.getConfigForExport().config;
      } // TOOLTIPS FOR DISABLED SCHEMA ACTIONS

    }, {
      key: "getImportDisabledTooltip",
      value: function getImportDisabledTooltip() {
        if (this.datasetAlreadyExists) {
          return "The dataset '".concat(this.datasetId, "' already exists. Its schema cannot be modified.");
        } else if (this.state.schemaAdvance) {
          return 'Importing a schema in Advanced mode is not supported';
        }

        return '';
      }
    }, {
      key: "getPropagateDisabledTooltip",
      value: function getPropagateDisabledTooltip() {
        if (this.state.node.type === 'splittertransform') {
          return 'Propagating a schema with Splitter plugins is currently not supported';
        } else if (this.state.schemaAdvance) {
          return 'Propagating a schema in Advanced mode is not supported';
        }

        return '';
      }
    }, {
      key: "getClearDisabledTooltip",
      value: function getClearDisabledTooltip() {
        if (this.datasetAlreadyExists) {
          return "The dataset '".concat(this.datasetId, "' already exists. Its schema cannot be cleared.");
        } else if (this.state.schemaAdvance) {
          return 'Clearing a schema in Advanced mode is not supported';
        }

        return '';
      }
    }, {
      key: "getIsMacroEnabled",
      value: function getIsMacroEnabled() {
        return !this.$scope.isDisabled && this.state.node._backendProperties['schema'] && this.state.node._backendProperties['schema'].macroSupported;
      }
    }, {
      key: "onClearSchema",
      value: function onClearSchema() {
        this.state.node['outputSchema'] = [{
          name: 'etlSchemaBody',
          schema: ''
        }];
        this.updateAngularPostSchemaUpdate();
      }
    }, {
      key: "onPropagateSchema",
      value: function onPropagateSchema() {
        this.showPropagateConfirm = true;
        this.updateAngularPostSchemaUpdate();
      }
    }, {
      key: "onMacroEnabled",
      value: function onMacroEnabled() {
        this.state.schemaAdvance = !this.state.schemaAdvance;
        this.updateAngularPostSchemaUpdate();
      }
    }, {
      key: "onSchemaChange",
      value: function onSchemaChange(outputSchemas) {
        this.state.node.outputSchema = outputSchemas;
        this.updateAngularPostSchemaUpdate();
      }
    }, {
      key: "onImportSchema",
      value: function onImportSchema(stringifiedSchema) {
        try {
          this.state.node.outputSchema = JSON.parse(stringifiedSchema);

          if (!Array.isArray(this.state.node.outputSchema)) {
            this.state.node.outputSchema = [this.state.node.outputSchema];
            this.updateAngularPostSchemaUpdate();
          }
        } catch (e) {
          this.state.node.outputSchema = [{
            name: 'etlSchemaBody',
            schema: ''
          }];
          this.updateAngularPostSchemaUpdate();
        }
      }
    }, {
      key: "updateAngularPostSchemaUpdate",
      value: function updateAngularPostSchemaUpdate() {
        try {
          this.$scope.$digest();
        } catch (e) {
          return;
        }
      }
    }, {
      key: "isSchemaMacro",
      value: function isSchemaMacro() {
        return this.state.schemaAdvance;
      }
    }, {
      key: "getActionsDropdownMap",
      value: function getActionsDropdownMap(isInputSchema) {
        var actionsMap = {};

        if (isInputSchema) {
          return {};
        }

        if (this.$scope.isDisabled) {
          return {
            "export": {
              value: 'export',
              label: 'Export',
              disabled: this.state.schemaAdvance,
              tooltip: this.state.schemaAdvance ? 'Exporting a schema in Advanced mode is not supported' : '',
              onClick: this.exportSchema.bind(this)
            }
          };
        }

        if (this.state.groupsConfig.outputSchema.implicitSchema) {
          return {
            "export": {
              value: 'export',
              label: 'Export',
              disabled: this.state.schemaAdvance,
              tooltip: this.state.schemaAdvance ? 'Exporting a schema in Advanced mode is not supported' : '',
              onClick: this.exportSchema.bind(this)
            },
            propagate: {
              value: 'propagate',
              label: 'Propagate',
              disabled: this.state.schemaAdvance || this.state.node.type === 'splittertransform',
              tooltip: this.getPropagateDisabledTooltip(),
              onClick: this.onPropagateSchema.bind(this)
            }
          };
        }

        if (this.getIsMacroEnabled()) {
          actionsMap['macro'] = {
            value: 'macro',
            label: this.state.schemaAdvance ? 'Editor' : 'Macro',
            disabled: this.datasetAlreadyExists,
            tooltip: this.datasetAlreadyExists ? "The dataset '".concat(this.datasetId, "' already exists. Its schema cannot be modified.") : '',
            onClick: this.onMacroEnabled.bind(this)
          };
        }

        actionsMap = Object.assign({}, actionsMap, {
          "import": {
            value: 'import',
            label: 'Import',
            disabled: this.datasetAlreadyExists || this.state.schemaAdvance,
            tooltip: this.getImportDisabledTooltip(),
            onClick: this.onSchemaImportLinkClick.bind(this)
          },
          "export": {
            value: 'export',
            label: 'Export',
            disabled: this.state.schemaAdvance,
            tooltip: this.state.schemaAdvance ? 'Exporting a schema in Advanced mode is not supported' : '',
            onClick: this.exportSchema.bind(this)
          },
          propagate: {
            value: 'propagate',
            label: 'Propagate',
            disabled: this.state.schemaAdvance || this.state.node.type === 'splittertransform',
            tooltip: this.getPropagateDisabledTooltip(),
            onClick: this.onPropagateSchema.bind(this)
          },
          clear: {
            value: 'clear',
            label: 'Clear',
            disabled: this.datasetAlreadyExists || this.state.schemaAdvance,
            tooltip: this.getClearDisabledTooltip(),
            onClick: this.onClearSchema.bind(this)
          }
        });
        return actionsMap;
      }
    }, {
      key: "setComments",
      value: function setComments(nodeId, comments) {
        this.state.node.information = this.state.node.information || {};
        this.state.node.information.comments = {
          list: comments
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

    return HydratorPlusPlusNodeConfigCtrl;
  }();

  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusNodeConfigCtrl', HydratorPlusPlusNodeConfigCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/create/partials/pipelineupgrade-modal-ctrl.js */

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
  angular.module(PKG.name + '.feature.hydrator').controller('PipelineUpgradeModalController', ["$scope", "rPipelineConfig", "HydratorUpgradeService", "$rootScope", "HydratorPlusPlusConfigStore", "$state", "DAGPlusPlusFactory", "GLOBALS", "HydratorPlusPlusLeftPanelStore", "rIsImport", function ($scope, rPipelineConfig, HydratorUpgradeService, $rootScope, HydratorPlusPlusConfigStore, $state, DAGPlusPlusFactory, GLOBALS, HydratorPlusPlusLeftPanelStore, rIsImport) {
    var _this = this;

    var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    var globalEvents = window.CaskCommon.globalEvents;
    this.pipelineConfig = rPipelineConfig;
    this.cdapVersion = $rootScope.cdapVersion;
    this.pipelineArtifact = HydratorUpgradeService.checkPipelineArtifactVersion(rPipelineConfig);
    this.problematicStages = [];
    this.canUpgradeStages = [];
    var allStages = [];
    var allPostActions = [];
    this.problematicPostRunActions = [];
    this.fixAllDisabled = true;
    this.isImport = rIsImport; // missing artifacts map

    this.missingArtifactsMap = {};
    this.loading = false;

    var checkStages = function checkStages() {
      if (_this.loading) {
        return;
      }

      _this.loading = true;
      HydratorUpgradeService.getErrorStages(rPipelineConfig).then(function (transformedStages) {
        allStages = transformedStages.stages.map(function (stage) {
          stage.icon = DAGPlusPlusFactory.getIcon(stage.stageInfo.plugin.name.toLowerCase());
          stage.type = GLOBALS.pluginConvert[stage.stageInfo.plugin.type];
          return stage;
        });
        allPostActions = transformedStages.postActions.map(function (stage) {
          stage.icon = DAGPlusPlusFactory.getIcon(stage.stageInfo.plugin.name.toLowerCase());
          stage.type = 'postaction';
          return stage;
        });
        _this.problematicStages = [];
        _this.canUpgradeStages = [];
        _this.problematicPostRunActions = [];
        _this.missingArtifactsMap = {};
        transformedStages.stages.forEach(function (artifact) {
          if (artifact.error === 'NOTFOUND') {
            var plugin = artifact.stageInfo.plugin;
            var mapKey = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name, "-").concat(plugin.artifact.version);
            _this.missingArtifactsMap[mapKey] = artifact;
          } else if (artifact.error === 'CAN_UPGRADE') {
            artifact.upgrade = true;

            _this.canUpgradeStages.push(artifact);
          } else if (artifact.error) {
            _this.problematicStages.push(artifact);
          }
        });
        transformedStages.postActions.forEach(function (artifact) {
          if (artifact.error === 'NOTFOUND') {
            var plugin = artifact.stageInfo.plugin;
            var mapKey = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name, "-").concat(plugin.artifact.version);
            _this.missingArtifactsMap[mapKey] = artifact;
          } else if (artifact.error) {
            _this.problematicPostRunActions.push(artifact);
          }
        });
        _this.fixAllDisabled = Object.keys(_this.missingArtifactsMap).length > 0;

        if (_this.problematicStages.length === 0 && _this.pipelineArtifact && _this.canUpgradeStages.length === 0 && _this.problematicPostRunActions.length === 0 && !_this.fixAllDisabled) {
          HydratorPlusPlusConfigStore.setState(HydratorPlusPlusConfigStore.getDefaults());
          var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
          rPipelineConfig.config.stages = rPipelineConfig.config.stages.map(function (stage) {
            return Object.assign({}, stage, {
              id: sanitize(stage.name)
            });
          });
          $state.go('hydrator.create', {
            data: rPipelineConfig
          });
        } else {
          _this.loading = false;
        }
      });
    };

    checkStages(); // This store subscription can cause the fetching of the plugins list to happen twice.
    // The reason is because in LeftPanelController, we fetch the default version map
    // with a 10 seconds timeout. So if user import before 10 seconds, it will make another
    // call to fetch list of plugins

    var sub = HydratorPlusPlusLeftPanelStore.subscribe(checkStages);

    this.openMarket = function () {
      eventEmitter.emit(globalEvents.OPENMARKET);
    };

    var fix = function fix(stagesList) {
      return stagesList.map(function (stage) {
        var updatedStageInfo = stage.stageInfo;

        if (stage.error && stage.error === 'NOTFOUND') {
          updatedStageInfo.error = true;
          updatedStageInfo.errorCount = 1;
          updatedStageInfo.errorMessage = 'Plugin cannot be found';
        } else if (stage.error) {
          if (stage.error === 'CAN_UPGRADE' && stage.upgrade || stage.error !== 'CAN_UPGRADE') {
            updatedStageInfo.plugin.artifact = stage.suggestion;
          }
        }

        return updatedStageInfo;
      });
    };

    this.fixAll = function () {
      var newConfig = HydratorUpgradeService.upgradePipelineArtifactVersion(rPipelineConfig); // Making a copy here so that the information in the modal does not change when
      // we modify the artifact information

      var copyAllStages = angular.copy(allStages);
      var copyPostActions = angular.copy(allPostActions);
      var stages = fix(copyAllStages);
      var postActions = fix(copyPostActions);
      var draftId;
      newConfig.config.stages = stages;
      newConfig.config.postActions = postActions;

      if (newConfig.__ui__) {
        draftId = newConfig.__ui__.draftId;
        delete newConfig.__ui__;
      }

      if (draftId) {
        newConfig.__ui__ = {
          draftId: draftId
        };
      }

      HydratorPlusPlusConfigStore.setState(HydratorPlusPlusConfigStore.getDefaults());
      $state.go('hydrator.create', {
        data: newConfig
      });
    };

    $scope.$on('$destroy', function () {
      sub();
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
  /* /controllers/create/partials/reference-tab-ctrl.js */

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
  var HydratorPlusPlusReferenceTabCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusReferenceTabCtrl.$inject = ["HydratorPlusPlusPluginConfigFactory", "GLOBALS", "myHelpers", "$scope"];
    function HydratorPlusPlusReferenceTabCtrl(HydratorPlusPlusPluginConfigFactory, GLOBALS, myHelpers, $scope) {
      _classCallCheck(this, HydratorPlusPlusReferenceTabCtrl);

      this.GLOBALS = GLOBALS;
      this.HydratorPlusPlusPluginConfigFactory = HydratorPlusPlusPluginConfigFactory;
      this.myHelpers = myHelpers;
      this.state = {};
      this.showContents($scope.node);
    }

    _createClass(HydratorPlusPlusReferenceTabCtrl, [{
      key: "showContents",
      value: function showContents(node) {
        var _this = this;

        if (!node.plugin) {
          this.state.docReference = this.GLOBALS.en.hydrator.studio.info['DEFAULT-REFERENCE'];
        } else {
          var key = "doc.".concat(node.plugin.name, "-").concat(node.type || node.plugin.type);
          this.HydratorPlusPlusPluginConfigFactory.fetchDocJson(this.myHelpers.objectQuery(node, 'plugin', 'artifact', 'name'), this.myHelpers.objectQuery(node, 'plugin', 'artifact', 'version'), this.myHelpers.objectQuery(node, 'plugin', 'artifact', 'scope'), key).then(function (res) {
            if (res[key]) {
              _this.state.docReference = res[key];
            } else {
              _this.state.docReference = _this.GLOBALS.en.hydrator.studio.info['NO-REFERENCE'];
            }
          }, function () {
            return _this.state.docReference = _this.GLOBALS.en.hydrator.studio.info['NO-REFERENCE'];
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

    return HydratorPlusPlusReferenceTabCtrl;
  }();

  HydratorPlusPlusReferenceTabCtrl.$inject = ['HydratorPlusPlusPluginConfigFactory', 'GLOBALS', 'myHelpers', '$scope'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).controller('HydratorPlusPlusReferenceTabCtrl', HydratorPlusPlusReferenceTabCtrl);
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
  /* /controllers/create/partials/settings-ctrl.js */

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
  var HydratorPlusPlusSettingsCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusSettingsCtrl.$inject = ["GLOBALS", "HydratorPlusPlusConfigStore", "HydratorPlusPlusConfigActions", "$scope"];
    function HydratorPlusPlusSettingsCtrl(GLOBALS, HydratorPlusPlusConfigStore, HydratorPlusPlusConfigActions, $scope) {
      var _this = this;

      _classCallCheck(this, HydratorPlusPlusSettingsCtrl);

      this.GLOBALS = GLOBALS;
      this.HydratorPlusPlusConfigActions = HydratorPlusPlusConfigActions;
      this.templateType = HydratorPlusPlusConfigStore.getArtifact().name;
      this.activeTab = 0; // If ETL Batch

      if (GLOBALS.etlBatchPipelines.includes(this.templateType)) {
        // Initialiting ETL Batch Schedule
        this.initialCron = HydratorPlusPlusConfigStore.getSchedule();
        this.cron = this.initialCron;
        this.engine = HydratorPlusPlusConfigStore.getEngine();
        this.isBasic = this.checkCron(this.initialCron);
        this.activeTab = this.isBasic ? 0 : 1; // Debounce method for setting schedule

        var setSchedule = _.debounce(function () {
          HydratorPlusPlusConfigActions.setSchedule(_this.cron);
        }, 1000);

        $scope.$watch(function () {
          return _this.cron;
        }, setSchedule);
      } // If ETL Realtime
      else if (this.templateType === GLOBALS.etlRealtime) {
          // Initializing ETL Realtime Instance
          this.instance = HydratorPlusPlusConfigStore.getInstance(); // Debounce method for setting instance

          var setInstance = _.debounce(function () {
            HydratorPlusPlusConfigActions.setInstance(_this.instance);
          }, 1000);

          $scope.$watch(function () {
            return _this.instance;
          }, setInstance);
        }
    }

    _createClass(HydratorPlusPlusSettingsCtrl, [{
      key: "checkCron",
      value: function checkCron(cron) {
        var pattern = /^[0-9\*\s]*$/g;
        var parse = cron.split('');

        for (var i = 0; i < parse.length; i++) {
          if (!parse[i].match(pattern)) {
            return false;
          }
        }

        return true;
      }
    }, {
      key: "onEngineChange",
      value: function onEngineChange() {
        this.HydratorPlusPlusConfigActions.setEngine(this.engine);
      }
    }, {
      key: "changeScheduler",
      value: function changeScheduler(type) {
        if (type === 'BASIC') {
          this.activeTab = 0;
          this.initialCron = this.cron;
          var check = true;

          if (!this.checkCron(this.initialCron)) {
            check = confirm('You have advanced configuration that is not available in basic mode. Are you sure you want to go to basic scheduler?');
          }

          if (check) {
            this.isBasic = true;
          }
        } else {
          this.activeTab = 1;
          this.isBasic = false;
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

    return HydratorPlusPlusSettingsCtrl;
  }();

  HydratorPlusPlusSettingsCtrl.$inject = ['GLOBALS', 'HydratorPlusPlusConfigStore', 'HydratorPlusPlusConfigActions', '$scope'];
  angular.module(PKG.name + '.feature.hydrator').controller('HydratorPlusPlusSettingsCtrl', HydratorPlusPlusSettingsCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /controllers/create/popovers/plugin-templates-create-edit-ctrl.js */

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
  angular.module("".concat(PKG.name, ".feature.hydrator")).controller('PluginTemplatesCreateEditCtrl', ["$scope", "PluginTemplatesDirStore", "PluginTemplatesDirActions", "HydratorPlusPlusPluginActions", "$stateParams", "myAlertOnValium", "rTemplateType", "HydratorPlusPlusLeftPanelStore", function ($scope, PluginTemplatesDirStore, PluginTemplatesDirActions, HydratorPlusPlusPluginActions, $stateParams, myAlertOnValium, rTemplateType, HydratorPlusPlusLeftPanelStore) {
    $scope.closeTemplateCreationModal = function () {
      PluginTemplatesDirActions.reset();
      $scope.$close();
    };

    $scope.pluginTemplateSaveError = null;
    PluginTemplatesDirStore.registerOnChangeListener(function () {
      var getIsSaveSuccessfull = PluginTemplatesDirStore.getIsSaveSuccessfull();
      var getIsCloseCommand = PluginTemplatesDirStore.getIsCloseCommand();

      if (getIsSaveSuccessfull) {
        PluginTemplatesDirActions.reset();
        HydratorPlusPlusLeftPanelStore.dispatch(HydratorPlusPlusPluginActions.fetchTemplates({
          namespace: $stateParams.namespace
        }, {
          namespace: $stateParams.namespace,
          pipelineType: rTemplateType
        }));
        myAlertOnValium.show({
          type: 'success',
          content: 'Plugin template saved successfully'
        });
        $scope.$close();
      }

      if (getIsCloseCommand) {
        PluginTemplatesDirActions.reset();
        $scope.$close();
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
  /* /controllers/create/popovers/plugin-templates-delete-ctrl.js */

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
  angular.module("".concat(PKG.name, ".feature.hydrator")).controller('PluginTemplatesDeleteCtrl', ["rNode", "$scope", "mySettings", "$stateParams", "myAlertOnValium", "HydratorPlusPlusPluginActions", "HydratorPlusPlusLeftPanelStore", "rTemplateType", function (rNode, $scope, mySettings, $stateParams, myAlertOnValium, HydratorPlusPlusPluginActions, HydratorPlusPlusLeftPanelStore, rTemplateType) {
    var node = rNode;
    $scope.templateName = node.pluginTemplate;

    $scope.ok = function () {
      $scope.disableOKButton = true;
      mySettings.get('pluginTemplates', true).then(function (res) {
        delete res[$stateParams.namespace][node.templateType][node.pluginType][node.pluginTemplate];
        return mySettings.set('pluginTemplates', res);
      }).then(function () {
        $scope.disableOKButton = false;
        myAlertOnValium.show({
          type: 'success',
          content: 'Successfully deleted template ' + node.pluginTemplate
        });
        HydratorPlusPlusLeftPanelStore.dispatch(HydratorPlusPlusPluginActions.fetchTemplates({
          namespace: $stateParams.namespace
        }, {
          namespace: $stateParams.namespace,
          pipelineType: rTemplateType
        }));
        $scope.$close();
      }, function (err) {
        $scope.disableButtons = false;
        $scope.error = err;
      });
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
  /* /controllers/create/popovers/pre-configured-ctrl.js */

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
  var HydratorPlusPlusPreConfiguredCtrl = /*#__PURE__*/function () {
    HydratorPlusPlusPreConfiguredCtrl.$inject = ["rTemplateType", "GLOBALS", "myPipelineTemplatesApi", "HydratorPlusPlusHydratorService", "HydratorPlusPlusCanvasFactory", "DAGPlusPlusNodesActionsFactory", "$state", "HydratorPlusPlusConfigStore", "myAlertOnValium"];
    function HydratorPlusPlusPreConfiguredCtrl(rTemplateType, GLOBALS, myPipelineTemplatesApi, HydratorPlusPlusHydratorService, HydratorPlusPlusCanvasFactory, DAGPlusPlusNodesActionsFactory, $state, HydratorPlusPlusConfigStore, myAlertOnValium) {
      var _this = this;

      _classCallCheck(this, HydratorPlusPlusPreConfiguredCtrl);

      this.currentPage = 1;
      this.templates = [];
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.HydratorPlusPlusCanvasFactory = HydratorPlusPlusCanvasFactory;
      this.myPipelineTemplatesApi = myPipelineTemplatesApi;
      this.DAGPlusPlusNodesActionsFactory = DAGPlusPlusNodesActionsFactory;
      this.HydratorPlusPlusConfigStore = HydratorPlusPlusConfigStore;
      this.GLOBALS = GLOBALS;
      this.$state = $state;
      this.myAlertOnValium = myAlertOnValium;
      this.typeFilter = rTemplateType;
      this.templateContext = this.GLOBALS.artifactConvert[rTemplateType];
      this.fetchTemplates().then(function (plugins) {
        _this.templates = plugins;
      });
    }

    _createClass(HydratorPlusPlusPreConfiguredCtrl, [{
      key: "selectTemplate",
      value: function selectTemplate(template) {
        this.HydratorPlusPlusConfigStore.setState(this.HydratorPlusPlusConfigStore.getDefaults());
        this.$state.go('hydrator.create', {
          data: template._properties,
          draftId: null
        });
      }
    }, {
      key: "fetchTemplates",
      value: function fetchTemplates() {
        var _this2 = this;

        return this.myPipelineTemplatesApi.list({
          apptype: this.typeFilter
        }).$promise.then(function (res) {
          var plugins = res.map(function (plugin) {
            return {
              name: plugin.name,
              description: plugin.description,
              type: _this2.typeFilter
            };
          });
          angular.forEach(plugins, function (plugin) {
            _this2.myPipelineTemplatesApi.get({
              apptype: _this2.typeFilter,
              appname: plugin.name
            }).$promise.then(function (res) {
              plugin._properties = res;
              delete plugin._properties.$promise;
              delete plugin._properties.$resolved;
              plugin._source = res.config.stages.filter(function (stage) {
                return _this2.GLOBALS.pluginConvert[stage.plugin.type] === 'source';
              });
              plugin._sinks = res.config.stages.filter(function (stage) {
                return _this2.GLOBALS.pluginConvert[stage.plugin.type] === 'sink';
              });
            });
          });
          return plugins;
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

    return HydratorPlusPlusPreConfiguredCtrl;
  }();

  HydratorPlusPlusPreConfiguredCtrl.$inject = ['rTemplateType', 'GLOBALS', 'myPipelineTemplatesApi', 'HydratorPlusPlusHydratorService', 'HydratorPlusPlusCanvasFactory', 'DAGPlusPlusNodesActionsFactory', '$state', 'HydratorPlusPlusConfigStore', 'myAlertOnValium'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).controller('HydratorPlusPlusPreConfiguredCtrl', HydratorPlusPlusPreConfiguredCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/create/actions/available-plugins-action-creator.js */

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
  var popoverTemplate = '/assets/features/hydrator/templates/create/popovers/leftpanel-plugin-popover.html';

  var PipelineAvailablePluginsActions = /*#__PURE__*/function () {
    PipelineAvailablePluginsActions.$inject = ["myPipelineApi", "GLOBALS", "$q", "AvailablePluginsStore", "AVAILABLE_PLUGINS_ACTIONS", "DAGPlusPlusFactory", "$filter", "myHelpers", "LEFTPANELSTORE_ACTIONS", "HydratorPlusPlusLeftPanelStore", "mySettings", "HydratorPlusPlusNodeService"];
    function PipelineAvailablePluginsActions(myPipelineApi, GLOBALS, $q, AvailablePluginsStore, AVAILABLE_PLUGINS_ACTIONS, DAGPlusPlusFactory, $filter, myHelpers, LEFTPANELSTORE_ACTIONS, HydratorPlusPlusLeftPanelStore, mySettings, HydratorPlusPlusNodeService) {
      _classCallCheck(this, PipelineAvailablePluginsActions);

      this.api = myPipelineApi;
      this.GLOBALS = GLOBALS;
      this.$q = $q;
      this.store = AvailablePluginsStore;
      this.actions = AVAILABLE_PLUGINS_ACTIONS;
      this.DAGPlusPlusFactory = DAGPlusPlusFactory;
      this.$filter = $filter;
      this.myHelpers = myHelpers;
      this.leftpanelactions = LEFTPANELSTORE_ACTIONS;
      this.leftpanelstore = HydratorPlusPlusLeftPanelStore;
      this.mySettings = mySettings;
      this.hydratorNodeService = HydratorPlusPlusNodeService;
    }

    _createClass(PipelineAvailablePluginsActions, [{
      key: "fetchPlugins",
      value: function fetchPlugins(extensionsParams, promise) {
        var _this = this;

        this.api.fetchExtensions(extensionsParams).$promise.then(function (res) {
          // filter out extensions
          var extensionsList = _this.GLOBALS.pluginTypes[extensionsParams.pipelineType];
          var extensionMap = Object.keys(extensionsList).map(function (ext) {
            return extensionsList[ext];
          });
          var supportedExtensions = res.filter(function (ext) {
            return extensionMap.indexOf(ext) !== -1;
          });

          _this._fetchPlugins(extensionsParams, supportedExtensions, promise);
        }, function (err) {
          if (promise) {
            promise.reject(err);
          }

          console.log('ERR: Fetching list of artifacts failed', err);
        });
      }
    }, {
      key: "fetchPluginsForDetails",
      value: function fetchPluginsForDetails(namespace, stages) {
        var _this2 = this;

        var availablePluginsMap = {};
        var pluginsList = [];
        this.api.getAllArtifacts({
          namespace: namespace
        }).$promise.then(function (res) {
          // create map for all available artifacts
          var artifactsMap = {};
          res.forEach(function (artifact) {
            var artifactKey = _this2._getArtifactKey(artifact);

            artifactsMap[artifactKey] = artifact;
          });
          stages.forEach(function (stage) {
            var stageArtifact = _this2.myHelpers.objectQuery(stage, 'plugin', 'artifact');

            var artifactKey = _this2._getArtifactKey(stageArtifact);

            if (!artifactsMap[artifactKey]) {
              return;
            }

            var pluginInfo = _this2._createPluginInfo(stage.plugin);

            availablePluginsMap[pluginInfo.key] = {
              pluginInfo: stage.plugin
            };
            pluginsList.push(pluginInfo);
          });

          _this2._fetchInfo(availablePluginsMap, namespace, pluginsList);
        });
      }
    }, {
      key: "fetchPluginsForUpgrade",
      value: function fetchPluginsForUpgrade(extensionsParams) {
        var deferred = this.$q.defer();
        this.fetchPlugins(extensionsParams, deferred);
        return deferred.promise;
      }
    }, {
      key: "_fetchPlugins",
      value: function _fetchPlugins(params, extensions, promise) {
        var _this3 = this;

        var fetchList = [];
        extensions.forEach(function (ext) {
          var fetchParams = Object.assign({}, params, {
            extensionType: ext
          });

          var fetchApi = _this3.api.fetchPlugins(fetchParams).$promise;

          fetchList.push(fetchApi);
        });
        this.$q.all(fetchList).then(function (res) {
          var pluginTypes = _this3._formatPluginsResponse(res, extensions);

          if (promise) {
            promise.resolve(pluginTypes);
            return;
          }

          _this3.leftpanelstore.dispatch({
            type: _this3.leftpanelactions.FETCH_ALL_PLUGINS,
            payload: {
              pluginTypes: pluginTypes,
              extensions: extensions
            }
          });

          _this3.leftpanelstore.dispatch({
            type: _this3.leftpanelactions.PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE
          });

          _this3._prepareInfoRequest(params.namespace, res);

          _this3._fetchTemplates(params.namespace, params.pipelineType);
        }, function (err) {
          if (promise) {
            promise.reject(err);
          }

          console.log('ERR: Fetching plugins', err);
        });
      }
    }, {
      key: "_fetchInfo",
      value: function _fetchInfo(availablePluginsMap, namespace, plugins) {
        var _this4 = this;

        var reqBody = plugins.map(function (plugin) {
          return plugin.info;
        });

        var getKeyFromPluginProps = function getKeyFromPluginProps(pluginProperties) {
          var key = _this4.myHelpers.objectQuery(pluginProperties, '0');

          return key ? key.split('.')[1] : '';
        };

        this.api.fetchAllPluginsProperties({
          namespace: namespace
        }, reqBody).$promise.then(function (res) {
          res.forEach(function (plugin) {
            var pluginProperties = Object.keys(plugin.properties);

            if (pluginProperties.length === 0) {
              return;
            }

            var pluginKey = getKeyFromPluginProps(pluginProperties);
            var key = "".concat(pluginKey, "-").concat(_this4._getArtifactKey(plugin));
            availablePluginsMap[key].doc = plugin.properties["doc.".concat(pluginKey)];
            var parsedWidgets;
            var widgets = plugin.properties["widgets.".concat(pluginKey)];

            if (widgets) {
              try {
                parsedWidgets = JSON.parse(widgets);
              } catch (e) {
                console.log('failed to parse widgets', e, pluginKey);
              }
            }

            availablePluginsMap[key].widgets = parsedWidgets;
          });

          _this4.store.dispatch({
            type: _this4.actions.setPluginsMap,
            payload: {
              pluginsMap: availablePluginsMap
            }
          });
        });
      }
    }, {
      key: "_createPluginInfo",
      value: function _createPluginInfo(plugin) {
        var pluginKey = "".concat(plugin.name, "-").concat(plugin.type);
        var availablePluginKey = "".concat(pluginKey, "-").concat(this._getArtifactKey(plugin.artifact));
        var info = Object.assign({}, plugin.artifact, {
          properties: ["widgets.".concat(pluginKey), "doc.".concat(pluginKey)]
        });
        return {
          info: info,
          key: availablePluginKey
        };
      }
      /**
       *
       * @param { name, version, scope } artifact
       */

    }, {
      key: "_getArtifactKey",
      value: function _getArtifactKey(artifact) {
        return "".concat(artifact.name, "-").concat(artifact.version, "-").concat(artifact.scope);
      }
    }, {
      key: "_prepareInfoRequest",
      value: function _prepareInfoRequest(namespace, pluginsList) {
        var _this5 = this;

        // Create request body for artifactproperties batch call
        var plugins = [];
        var availablePluginsMap = {};
        pluginsList.forEach(function (extension) {
          extension.forEach(function (plugin) {
            var pluginInfo = _this5._createPluginInfo(plugin);

            availablePluginsMap[pluginInfo.key] = {
              pluginInfo: plugin
            };
            plugins.push(pluginInfo);
          });
        });

        this._fetchInfo(availablePluginsMap, namespace, plugins);
      }
    }, {
      key: "_getPluginsWithAddedInfo",
      value: function _getPluginsWithAddedInfo() {
        var _this6 = this;

        var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var pluginToArtifactArrayMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var extension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

        if ([plugins.length, extension.length].indexOf(0) !== -1) {
          return plugins;
        }

        var getExtraProperties = function getExtraProperties() {
          var plugin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var extension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
          return Object.assign({}, {
            type: extension,
            icon: _this6.DAGPlusPlusFactory.getIcon(plugin.name || plugin.pluginName),
            label: _this6.$filter('myRemoveCamelcase')(plugin.name || plugin.pluginName),
            template: popoverTemplate
          });
        };

        var getAllArtifacts = function getAllArtifacts() {
          var _pluginToArtifactArrayMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          var plugin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var extension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

          if ([Object.keys(_pluginToArtifactArrayMap).length, Object.keys(plugin).length].indexOf(0) !== -1) {
            return [];
          }

          var _pluginArtifacts = _pluginToArtifactArrayMap[plugin.name || plugin.pluginName];

          if (!Array.isArray(_pluginArtifacts)) {
            return [];
          }

          return _toConsumableArray(_pluginArtifacts).map(function (plug) {
            return Object.assign({}, plug, getExtraProperties(plug, extension));
          });
        };

        var getArtifact = function getArtifact() {
          var _pluginToArtifactArrayMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          var plugin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          if (!Object.keys(plugin).length) {
            return {};
          }

          var allPluginVersions = _pluginToArtifactArrayMap[plugin.name];
          var highestVersion = window.CaskCommon.VersionUtilities.findHighestVersion(allPluginVersions.map(function (plugin) {
            return _this6.myHelpers.objectQuery(plugin, 'artifact', 'version');
          }), true);
          var latestPluginVersion = allPluginVersions.find(function (plugin) {
            return _this6.myHelpers.objectQuery(plugin, 'artifact', 'version') === highestVersion;
          });
          return latestPluginVersion.artifact;
        };

        return Object.keys(pluginToArtifactArrayMap).map(function (pluginName) {
          var plugin = pluginToArtifactArrayMap[pluginName][0];
          return Object.assign({}, plugin, getExtraProperties(plugin, extension), {
            artifact: getArtifact(pluginToArtifactArrayMap, plugin),
            allArtifacts: getAllArtifacts(pluginToArtifactArrayMap, plugin, extension)
          });
        });
      }
    }, {
      key: "_formatPluginsResponse",
      value: function _formatPluginsResponse(pluginsList, extensions) {
        var _this7 = this;

        var pluginTypes = {};
        extensions.forEach(function (ext, i) {
          var plugins = pluginsList[i];

          var pluginToArtifactArrayMap = _this7.hydratorNodeService.getPluginToArtifactMap(plugins);

          var pluginsWithAddedInfo = _this7._getPluginsWithAddedInfo(plugins, pluginToArtifactArrayMap, ext); // Fetch default version


          var versionMap = _this7.leftpanelstore.getState().plugins.pluginToVersionMap;

          pluginTypes[ext] = pluginsWithAddedInfo.map(function (plugin) {
            plugin.defaultArtifact = _this7.hydratorNodeService.getDefaultVersionForPlugin(plugin, versionMap);
            return plugin;
          });
        });
        return pluginTypes;
      }
    }, {
      key: "_fetchTemplates",
      value: function _fetchTemplates(namespace, pipelineType) {
        var _this8 = this;

        this.mySettings.get('pluginTemplates').then(function (res) {
          if (!res) {
            return;
          }

          _this8.leftpanelstore.dispatch({
            type: _this8.leftpanelactions.PLUGIN_TEMPLATE_FETCH,
            payload: {
              res: res,
              pipelineType: pipelineType,
              namespace: namespace
            }
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

    return PipelineAvailablePluginsActions;
  }();

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('PipelineAvailablePluginsActions', PipelineAvailablePluginsActions);
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
  /* /services/create/actions/config-actions.js */

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
  var HydratorPlusPlusConfigActions = /*#__PURE__*/function () {
    HydratorPlusPlusConfigActions.$inject = ["HydratorPlusPlusConfigDispatcher"];
    function HydratorPlusPlusConfigActions(HydratorPlusPlusConfigDispatcher) {
      'ngInject';

      _classCallCheck(this, HydratorPlusPlusConfigActions);

      this.dispatcher = HydratorPlusPlusConfigDispatcher.getDispatcher();
    }

    _createClass(HydratorPlusPlusConfigActions, [{
      key: "initializeConfigStore",
      value: function initializeConfigStore(config) {
        this.dispatcher.dispatch('onInitialize', config);
      }
    }, {
      key: "setMetadataInfo",
      value: function setMetadataInfo(name, description) {
        this.dispatcher.dispatch('onMetadataInfoSave', name, description);
      }
    }, {
      key: "setDescription",
      value: function setDescription(description) {
        this.dispatcher.dispatch('onDescriptionSave', description);
      }
    }, {
      key: "setConfig",
      value: function setConfig(config) {
        this.dispatcher.dispatch('onConfigSave', config);
      }
    }, {
      key: "saveAsDraft",
      value: function saveAsDraft() {
        this.dispatcher.dispatch('onSaveAsDraft');
      }
    }, {
      key: "setEngine",
      value: function setEngine(engine) {
        this.dispatcher.dispatch('onEngineChange', engine);
      }
    }, {
      key: "editPlugin",
      value: function editPlugin(pluginId, pluginProperties) {
        this.dispatcher.dispatch('onPluginEdit', pluginId, pluginProperties);
      }
    }, {
      key: "propagateSchemaDownStream",
      value: function propagateSchemaDownStream(pluginId) {
        this.dispatcher.dispatch('onSchemaPropagationDownStream', pluginId);
      }
    }, {
      key: "setSchedule",
      value: function setSchedule(schedule) {
        this.dispatcher.dispatch('onSetSchedule', schedule);
      }
    }, {
      key: "setInstance",
      value: function setInstance(instance) {
        this.dispatcher.dispatch('onSetInstance', instance);
      }
    }, {
      key: "setBatchInterval",
      value: function setBatchInterval(batchInterval) {
        this.dispatcher.dispatch('onSetBatchInterval', batchInterval);
      }
    }, {
      key: "setVirtualCores",
      value: function setVirtualCores(virtualCores) {
        this.dispatcher.dispatch('onSetVirtualCores', virtualCores);
      }
    }, {
      key: "setMemoryMB",
      value: function setMemoryMB(memoryMB) {
        this.dispatcher.dispatch('onSetMemoryMB', memoryMB);
      }
    }, {
      key: "setDriverVirtualCores",
      value: function setDriverVirtualCores(virtualCores) {
        this.dispatcher.dispatch('onSetDriverVirtualCores', virtualCores);
      }
    }, {
      key: "setDriverMemoryMB",
      value: function setDriverMemoryMB(memoryMB) {
        this.dispatcher.dispatch('onSetDriverMemoryMB', memoryMB);
      }
    }, {
      key: "setClientVirtualCores",
      value: function setClientVirtualCores(virtualCores) {
        this.dispatcher.dispatch('onSetClientVirtualCores', virtualCores);
      }
    }, {
      key: "setClientMemoryMB",
      value: function setClientMemoryMB(memoryMB) {
        this.dispatcher.dispatch('onSetClientMemoryMB', memoryMB);
      }
    }, {
      key: "addPostAction",
      value: function addPostAction(config) {
        this.dispatcher.dispatch('onAddPostAction', config);
      }
    }, {
      key: "editPostAction",
      value: function editPostAction(config) {
        this.dispatcher.dispatch('onEditPostAction', config);
      }
    }, {
      key: "deletePostAction",
      value: function deletePostAction(config) {
        this.dispatcher.dispatch('onDeletePostAction', config);
      }
    }, {
      key: "setMaxConcurrentRuns",
      value: function setMaxConcurrentRuns(num) {
        this.dispatcher.dispatch('onSetMaxConcurrentRuns', num);
      }
    }, {
      key: "publishPipeline",
      value: function publishPipeline() {
        this.dispatcher.dispatch('onPublishPipeline');
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusConfigActions;
  }();

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConfigActions', HydratorPlusPlusConfigActions);
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
  /* /services/create/actions/console-actions.js */

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
  var HydratorPlusPlusConsoleActions = /*#__PURE__*/function () {
    HydratorPlusPlusConsoleActions.$inject = ["HydratorPlusPlusConsoleDispatcher"];
    function HydratorPlusPlusConsoleActions(HydratorPlusPlusConsoleDispatcher) {
      _classCallCheck(this, HydratorPlusPlusConsoleActions);

      this.hydratorPlusPlusConsoleDispatcher = HydratorPlusPlusConsoleDispatcher.getDispatcher();
    }

    _createClass(HydratorPlusPlusConsoleActions, [{
      key: "addMessage",
      value: function addMessage(message) {
        this.hydratorPlusPlusConsoleDispatcher.dispatch('onAddMessage', message);
      }
    }, {
      key: "resetMessages",
      value: function resetMessages() {
        this.hydratorPlusPlusConsoleDispatcher.dispatch('onResetMessages');
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusConsoleActions;
  }();

  HydratorPlusPlusConsoleActions.$inject = ['HydratorPlusPlusConsoleDispatcher'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConsoleActions', HydratorPlusPlusConsoleActions);
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
  /* /services/create/actions/leftpanel-action-creator.js */

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
  var HydratorPlusPlusPluginActions = /*#__PURE__*/function () {
    HydratorPlusPlusPluginActions.$inject = ["myPipelineApi", "GLOBALS", "mySettings", "LEFTPANELSTORE_ACTIONS"];
    function HydratorPlusPlusPluginActions(myPipelineApi, GLOBALS, mySettings, LEFTPANELSTORE_ACTIONS) {
      _classCallCheck(this, HydratorPlusPlusPluginActions);

      this.api = myPipelineApi;
      this.GLOBALS = GLOBALS;
      this.mySettings = mySettings;
      this.leftpanelactions = LEFTPANELSTORE_ACTIONS;
    }

    _createClass(HydratorPlusPlusPluginActions, [{
      key: "fetchExtensions",
      value: function fetchExtensions(params) {
        var _this = this;

        return function (dispatch) {
          _this.api.fetchExtensions(params).$promise.then(function (res) {
            return dispatch({
              type: _this.leftpanelactions.EXTENSIONS_FETCH,
              payload: Object.assign({}, {
                pipelineType: params.pipelineType,
                extensions: res
              })
            });
          }, function (err) {
            return console.log('ERR: Fetching list of artifacts failed', err);
          });
        };
      }
    }, {
      key: "fetchPlugins",
      value: function fetchPlugins(extension, params) {
        var _this2 = this;

        return function (dispatch) {
          return _this2.api.fetchPlugins(params).$promise.then(function (res) {
            return dispatch({
              type: _this2.leftpanelactions.PLUGINS_FETCH,
              payload: {
                extension: extension,
                plugins: res
              }
            });
          }, function (err) {
            return console.log("ERR: Fetch list of plugins for ".concat(extension, " failed: ").concat(err));
          });
        };
      }
    }, {
      key: "fetchTemplates",
      value: function fetchTemplates(params, pipelineObj) {
        var _this3 = this;

        var pipelineType = pipelineObj.pipelineType,
            namespace = pipelineObj.namespace;
        return function (dispatch) {
          _this3.mySettings.get('pluginTemplates').then(function (res) {
            if (!res) {
              return;
            }

            dispatch({
              type: _this3.leftpanelactions.PLUGIN_TEMPLATE_FETCH,
              payload: {
                res: res,
                pipelineType: pipelineType,
                namespace: namespace
              }
            });
          });
        };
      }
    }, {
      key: "fetchDefaultVersion",
      value: function fetchDefaultVersion() {
        var _this4 = this;

        return function (dispatch) {
          _this4.mySettings.get('plugin-default-version').then(function (res) {
            if (!res) {
              return;
            }

            dispatch({
              type: _this4.leftpanelactions.PLUGINS_DEFAULT_VERSION_FETCH,
              payload: {
                res: res
              }
            });
          });
        };
      }
    }, {
      key: "updateDefaultVersion",
      value: function updateDefaultVersion(plugin) {
        var _this5 = this;

        return function (dispatch) {
          _this5.mySettings.get('plugin-default-version').then(function (res) {
            var key = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name);
            res = res || {};
            res[key] = plugin.artifact;
            return _this5.mySettings.set('plugin-default-version', res);
          }).then(function () {
            return _this5.mySettings.get('plugin-default-version');
          }).then(function (res) {
            if (!res) {
              return;
            }

            dispatch({
              type: _this5.leftpanelactions.PLUGINS_DEFAULT_VERSION_FETCH,
              payload: {
                res: res
              }
            });
          });
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

    return HydratorPlusPlusPluginActions;
  }();

  HydratorPlusPlusPluginActions.$inject = ['myPipelineApi', 'GLOBALS', 'mySettings', 'LEFTPANELSTORE_ACTIONS'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusPluginActions', HydratorPlusPlusPluginActions);
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
  /* /services/create/actions/preview-action-creator.js */

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
  var HydratorPlusPlusPreviewActions = /*#__PURE__*/function () {
    HydratorPlusPlusPreviewActions.$inject = ["PREVIEWSTORE_ACTIONS"];
    function HydratorPlusPlusPreviewActions(PREVIEWSTORE_ACTIONS) {
      'ngInject';

      _classCallCheck(this, HydratorPlusPlusPreviewActions);

      this.previewActions = PREVIEWSTORE_ACTIONS;
    }

    _createClass(HydratorPlusPlusPreviewActions, [{
      key: "togglePreviewMode",
      value: function togglePreviewMode(isPreviewModeEnabled) {
        var _this = this;

        return function (dispatch) {
          dispatch({
            type: _this.previewActions.TOGGLE_PREVIEW_MODE,
            payload: {
              isPreviewModeEnabled: isPreviewModeEnabled
            }
          });
        };
      }
    }, {
      key: "setPreviewStartTime",
      value: function setPreviewStartTime(startTime) {
        var _this2 = this;

        return function (dispatch) {
          dispatch({
            type: _this2.previewActions.SET_PREVIEW_START_TIME,
            payload: {
              startTime: startTime
            }
          });
        };
      }
    }, {
      key: "setPreviewData",
      value: function setPreviewData() {
        var _this3 = this;

        return function (dispatch) {
          dispatch({
            type: _this3.previewActions.SET_PREVIEW_DATA
          });
        };
      }
    }, {
      key: "resetPreviewData",
      value: function resetPreviewData() {
        var _this4 = this;

        return function (dispatch) {
          dispatch({
            type: _this4.previewActions.RESET_PREVIEW_DATA
          });
        };
      }
    }, {
      key: "setPreviewId",
      value: function setPreviewId(previewId) {
        var _this5 = this;

        return function (dispatch) {
          dispatch({
            type: _this5.previewActions.SET_PREVIEW_ID,
            payload: {
              previewId: previewId
            }
          });
        };
      }
    }, {
      key: "resetPreview",
      value: function resetPreview() {
        var _this6 = this;

        return function (dispatch) {
          dispatch({
            type: _this6.previewActions.PREVIEW_RESET
          });
        };
      }
    }, {
      key: "setMacros",
      value: function setMacros(macrosMap) {
        var _this7 = this;

        return function (dispatch) {
          dispatch({
            type: _this7.previewActions.SET_MACROS,
            payload: {
              macrosMap: macrosMap
            }
          });
        };
      }
    }, {
      key: "setUserRuntimeArguments",
      value: function setUserRuntimeArguments(userRuntimeArgumentsMap) {
        var _this8 = this;

        return function (dispatch) {
          dispatch({
            type: _this8.previewActions.SET_USER_RUNTIME_ARGUMENTS,
            payload: {
              userRuntimeArgumentsMap: userRuntimeArgumentsMap
            }
          });
        };
      }
    }, {
      key: "setMacrosAndUserRuntimeArgs",
      value: function setMacrosAndUserRuntimeArgs(macrosMap, userRuntimeArgumentsMap) {
        var _this9 = this;

        return function (dispatch) {
          dispatch({
            type: _this9.previewActions.SET_MACROS,
            payload: {
              macrosMap: macrosMap
            }
          });
          dispatch({
            type: _this9.previewActions.SET_USER_RUNTIME_ARGUMENTS,
            payload: {
              userRuntimeArgumentsMap: userRuntimeArgumentsMap
            }
          });
        };
      }
    }, {
      key: "setRuntimeArgsForDisplay",
      value: function setRuntimeArgsForDisplay(args) {
        var _this10 = this;

        return function (dispatch) {
          dispatch({
            type: _this10.previewActions.SET_RUNTIME_ARGS_FOR_DISPLAY,
            payload: {
              args: args
            }
          });
        };
      }
    }, {
      key: "setTimeoutInMinutes",
      value: function setTimeoutInMinutes(timeoutInMinutes) {
        var _this11 = this;

        return function (dispatch) {
          dispatch({
            type: _this11.previewActions.SET_TIMEOUT_IN_MINUTES,
            payload: {
              timeoutInMinutes: timeoutInMinutes
            }
          });
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

    return HydratorPlusPlusPreviewActions;
  }();

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusPreviewActions', HydratorPlusPlusPreviewActions);
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
  /* /services/create/dispatchers/config-dispatcher.js */

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
  var HydratorPlusPlusConfigDispatcher = /*#__PURE__*/function () {
    HydratorPlusPlusConfigDispatcher.$inject = ["CaskAngularDispatcher"];
    function HydratorPlusPlusConfigDispatcher(CaskAngularDispatcher) {
      _classCallCheck(this, HydratorPlusPlusConfigDispatcher);

      this.baseDispatcher = CaskAngularDispatcher;
      this.__dispatcher__ = null;
    }

    _createClass(HydratorPlusPlusConfigDispatcher, [{
      key: "getDispatcher",
      value: function getDispatcher() {
        if (!this.__dispatcher__) {
          this.__dispatcher__ = new this.baseDispatcher();
        }

        return this.__dispatcher__;
      }
    }, {
      key: "destroyDispatcher",
      value: function destroyDispatcher() {
        delete this.__dispatcher__;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusConfigDispatcher;
  }();

  HydratorPlusPlusConfigDispatcher.$inject = ['CaskAngularDispatcher'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConfigDispatcher', HydratorPlusPlusConfigDispatcher);
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
  /* /services/create/dispatchers/console-dispatcher.js */

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
  var HydratorPlusPlusConsoleDispatcher = /*#__PURE__*/function () {
    HydratorPlusPlusConsoleDispatcher.$inject = ["CaskAngularDispatcher"];
    function HydratorPlusPlusConsoleDispatcher(CaskAngularDispatcher) {
      _classCallCheck(this, HydratorPlusPlusConsoleDispatcher);

      this.baseDispatcher = CaskAngularDispatcher;
      this.__dispatcher__ = null;
    }

    _createClass(HydratorPlusPlusConsoleDispatcher, [{
      key: "getDispatcher",
      value: function getDispatcher() {
        if (!this.__dispatcher__) {
          this.__dispatcher__ = new this.baseDispatcher();
        }

        return this.__dispatcher__;
      }
    }, {
      key: "destroyDispatcher",
      value: function destroyDispatcher() {
        delete this.__dispatcher__;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusConsoleDispatcher;
  }();

  HydratorPlusPlusConsoleDispatcher.$inject = ['CaskAngularDispatcher'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConsoleDispatcher', HydratorPlusPlusConsoleDispatcher);
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
  /* /services/create/dispatchers/plugins-dispatcher.js */

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
  var HydratorPlusPlusPluginsDispatcher = /*#__PURE__*/function () {
    HydratorPlusPlusPluginsDispatcher.$inject = ["CaskAngularDispatcher"];
    function HydratorPlusPlusPluginsDispatcher(CaskAngularDispatcher) {
      _classCallCheck(this, HydratorPlusPlusPluginsDispatcher);

      this.__dispatcher__ = null;
      this.baseDispatcher = CaskAngularDispatcher;
    }

    _createClass(HydratorPlusPlusPluginsDispatcher, [{
      key: "getDispatcher",
      value: function getDispatcher() {
        if (!this.__dispatcher__) {
          this.__dispatcher__ = new this.baseDispatcher();
        }

        return this.__dispatcher__;
      }
    }, {
      key: "destroyDispatcher",
      value: function destroyDispatcher() {
        delete this.__dispatcher__;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusPluginsDispatcher;
  }();

  HydratorPlusPlusPluginsDispatcher.$inject = ['CaskAngularDispatcher'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusPluginsDispatcher', HydratorPlusPlusPluginsDispatcher);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/create/stores/available-plugins-store.js */

  /*
   * Copyright © 2017-2018 Cask Data, Inc.
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
  angular.module("".concat(PKG.name, ".feature.hydrator")).constant('AVAILABLE_PLUGINS_ACTIONS', window.CaskCommon.AVAILABLE_PLUGINS_ACTIONS).factory('AvailablePluginsStore', function () {
    return window.CaskCommon.AvailablePluginsStore;
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
  /* /services/create/stores/config-store.js */

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
  var HydratorPlusPlusConfigStore = /*#__PURE__*/function () {
    HydratorPlusPlusConfigStore.$inject = ["HydratorPlusPlusConfigDispatcher", "HydratorPlusPlusCanvasFactory", "GLOBALS", "mySettings", "HydratorPlusPlusConsoleActions", "$stateParams", "NonStorePipelineErrorFactory", "HydratorPlusPlusHydratorService", "$q", "HydratorPlusPlusPluginConfigFactory", "uuid", "$state", "HYDRATOR_DEFAULT_VALUES", "myHelpers", "MY_CONFIG", "EventPipe", "myPipelineApi", "myAppsApi", "HydratorPlusPlusNodeService"];
    function HydratorPlusPlusConfigStore(HydratorPlusPlusConfigDispatcher, HydratorPlusPlusCanvasFactory, GLOBALS, mySettings, HydratorPlusPlusConsoleActions, $stateParams, NonStorePipelineErrorFactory, HydratorPlusPlusHydratorService, $q, HydratorPlusPlusPluginConfigFactory, uuid, $state, HYDRATOR_DEFAULT_VALUES, myHelpers, MY_CONFIG, EventPipe, myPipelineApi, myAppsApi, HydratorPlusPlusNodeService) {
      'ngInject';

      _classCallCheck(this, HydratorPlusPlusConfigStore);

      this.state = {};
      this.mySettings = mySettings;
      this.myHelpers = myHelpers;
      this.HydratorPlusPlusConsoleActions = HydratorPlusPlusConsoleActions;
      this.HydratorPlusPlusCanvasFactory = HydratorPlusPlusCanvasFactory;
      this.GLOBALS = GLOBALS;
      this.$stateParams = $stateParams;
      this.NonStorePipelineErrorFactory = NonStorePipelineErrorFactory;
      this.HydratorPlusPlusHydratorService = HydratorPlusPlusHydratorService;
      this.HydratorPlusPlusNodeService = HydratorPlusPlusNodeService;
      this.$q = $q;
      this.HydratorPlusPlusPluginConfigFactory = HydratorPlusPlusPluginConfigFactory;
      this.uuid = uuid;
      this.$state = $state;
      this.HYDRATOR_DEFAULT_VALUES = HYDRATOR_DEFAULT_VALUES;
      this.EventPipe = EventPipe;
      this.myPipelineApi = myPipelineApi;
      this.myAppsApi = myAppsApi;
      this.isDistributed = MY_CONFIG.isEnterprise ? true : false;
      this.changeListeners = [];
      this.setDefaults();
      this.hydratorPlusPlusConfigDispatcher = HydratorPlusPlusConfigDispatcher.getDispatcher();
      this.hydratorPlusPlusConfigDispatcher.register('onEngineChange', this.setEngine.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onMetadataInfoSave', this.setMetadataInformation.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onPluginEdit', this.editNodeProperties.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetSchedule', this.setSchedule.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetInstance', this.setInstance.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetBatchInterval', this.setBatchInterval.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetVirtualCores', this.setVirtualCores.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetMemoryMB', this.setMemoryMB.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetDriverVirtualCores', this.setDriverVirtualCores.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetDriverMemoryMB', this.setDriverMemoryMB.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetClientVirtualCores', this.setClientVirtualCores.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetClientMemoryMB', this.setClientMemoryMB.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSaveAsDraft', this.saveAsDraft.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onInitialize', this.init.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSchemaPropagationDownStream', this.propagateIOSchemas.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onAddPostAction', this.addPostAction.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onEditPostAction', this.editPostAction.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onDeletePostAction', this.deletePostAction.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onSetMaxConcurrentRuns', this.setMaxConcurrentRuns.bind(this));
      this.hydratorPlusPlusConfigDispatcher.register('onPublishPipeline', this.publishPipeline.bind(this));
    }

    _createClass(HydratorPlusPlusConfigStore, [{
      key: "registerOnChangeListener",
      value: function registerOnChangeListener(callback) {
        var _this = this;

        // index of the listener to be removed while un-subscribing
        var index = this.changeListeners.push(callback) - 1; // un-subscribe for listeners.

        return function () {
          _this.changeListeners.splice(index, 1);
        };
      }
    }, {
      key: "emitChange",
      value: function emitChange() {
        this.changeListeners.forEach(function (callback) {
          return callback();
        });
      }
    }, {
      key: "setDefaults",
      value: function setDefaults(config) {
        this.state = {
          artifact: {
            name: '',
            scope: 'SYSTEM',
            version: ''
          },
          __ui__: {
            nodes: []
          },
          description: '',
          name: ''
        };
        Object.assign(this.state, {
          config: this.getDefaultConfig()
        }); // This will be eventually used when we just pass on a config to the store to draw the dag.

        if (config) {
          angular.extend(this.state, config);
          this.setComments(this.state.config.comments);
          this.setArtifact(this.state.artifact);
          this.setProperties(this.state.config.properties);
          this.setDriverResources(this.state.config.driverResources);
          this.setResources(this.state.config.resources);
          this.setInstrumentation(this.state.config.processTimingEnabled);
          this.setStageLogging(this.state.config.stageLoggingEnabled);
          this.setNodes(this.state.config.stages || []);

          if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
            this.setClientResources(this.state.config.clientResources);
            this.setCheckpointing(this.state.config.disableCheckpoints);
            this.setCheckpointDir(this.state.config.checkpointDir || window.CDAP_CONFIG.hydrator.defaultCheckpointDir);
            this.setGracefulStop(this.state.config.stopGracefully);
            this.setBatchInterval(this.state.config.batchInterval);
          } else if (this.state.artifact.name === this.GLOBALS.eltSqlPipeline) {
            this.setServiceAccountPath(this.state.config.serviceAccountPath || '');
          } else {
            this.setEngine(this.state.config.engine);
            this.setRangeRecordsPreview(this.state.artifact.config || {});
            this.setNumRecordsPreview(this.state.config.numOfRecordsPreview);
            this.setMaxConcurrentRuns(this.state.config.maxConcurrentRuns);
          }
        }

        this.__defaultState = angular.copy(this.state);
      }
    }, {
      key: "getDefaults",
      value: function getDefaults() {
        return this.__defaultState;
      }
    }, {
      key: "init",
      value: function init(config) {
        this.setDefaults(config);
      }
    }, {
      key: "getDefaultConfig",
      value: function getDefaultConfig() {
        return {
          resources: angular.copy(this.HYDRATOR_DEFAULT_VALUES.resources),
          driverResources: angular.copy(this.HYDRATOR_DEFAULT_VALUES.resources),
          connections: [],
          comments: [],
          postActions: [],
          properties: {},
          processTimingEnabled: true,
          stageLoggingEnabled: this.HYDRATOR_DEFAULT_VALUES.stageLoggingEnabled
        };
      }
    }, {
      key: "setState",
      value: function setState(state) {
        this.state = state;
      }
    }, {
      key: "getState",
      value: function getState() {
        return angular.copy(this.state);
      }
    }, {
      key: "getDraftId",
      value: function getDraftId() {
        return this.$stateParams.draftId;
      }
    }, {
      key: "getArtifact",
      value: function getArtifact() {
        return this.getState().artifact;
      }
    }, {
      key: "getAppType",
      value: function getAppType() {
        return this.getState().artifact.name;
      }
    }, {
      key: "getConnections",
      value: function getConnections() {
        return this.getConfig().connections;
      }
    }, {
      key: "getConfig",
      value: function getConfig() {
        return this.getState().config;
      }
    }, {
      key: "generateConfigFromState",
      value: function generateConfigFromState() {
        var _this2 = this;

        var config = this.getDefaultConfig();
        var nodesMap = {};

        this.state.__ui__.nodes.forEach(function (n) {
          nodesMap[n.name] = angular.copy(n);
        }); // Strip out schema property of the plugin if format is clf or syslog


        var stripFormatSchemas = function stripFormatSchemas(formatProp, outputSchemaProp, properties) {
          if (!formatProp || !outputSchemaProp) {
            return properties;
          }

          if (['clf', 'syslog'].indexOf(properties[formatProp]) !== -1) {
            delete properties[outputSchemaProp];
          }

          return properties;
        };

        var addPluginToConfig = function addPluginToConfig(node, id) {
          var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;

          if (node.outputSchemaProperty) {
            try {
              var outputSchema = JSON.parse(node.outputSchema);

              if (angular.isArray(outputSchema.fields)) {
                outputSchema.fields = outputSchema.fields.filter(function (field) {
                  return !field.readonly;
                });
              }

              node.plugin.properties[node.outputSchemaProperty] = JSON.stringify(outputSchema);
            } catch (e) {
              console.log('Failed to parse output schema of plugin: ', node.plugin);
            }
          }

          node.plugin.properties = stripFormatSchemas(node.watchProperty, node.outputSchemaProperty, angular.copy(node.plugin.properties));
          var configObj = {
            name: node.plugin.label || node.name || node.plugin.name,
            plugin: {
              // Solely adding id and _backendProperties for validation.
              // Should be removed while saving it to backend.
              name: node.plugin.name,
              type: node.type || node.plugin.type,
              label: node.plugin.label,
              artifact: node.plugin.artifact,
              properties: node.plugin.properties,
              _backendProperties: node._backendProperties
            },
            information: node.information,
            outputSchema: node.outputSchema,
            inputSchema: node.inputSchema
          };
          configObj.id = sanitize(configObj.name);

          if (node.errorDatasetName) {
            configObj.errorDatasetName = node.errorDatasetName;
          }

          config.stages.push(configObj);
          delete nodesMap[id];
        };

        var connections = this.HydratorPlusPlusCanvasFactory.orderConnections(angular.copy(this.state.config.connections), this.state.artifact.name, this.state.__ui__.nodes);
        config.stages = [];
        connections.forEach(function (connection) {
          var fromConnectionName, toConnectionName;
          var fromPluginName, toPluginName;

          if (nodesMap[connection.from]) {
            fromPluginName = nodesMap[connection.from].plugin.label || nodesMap[connection.from].name;
            fromConnectionName = fromPluginName;
            addPluginToConfig(nodesMap[connection.from], connection.from);
          } else {
            fromConnectionName = _this2.state.__ui__.nodes.filter(function (n) {
              return n.name === connection.from;
            })[0];
            fromPluginName = fromConnectionName.plugin.label || fromConnectionName.name;
            fromConnectionName = fromPluginName;
          }

          if (nodesMap[connection.to]) {
            toConnectionName = nodesMap[connection.to].plugin.label || nodesMap[connection.to].name;
            addPluginToConfig(nodesMap[connection.to], connection.to);
          } else {
            toConnectionName = _this2.state.__ui__.nodes.filter(function (n) {
              return n.name === connection.to;
            })[0];
            toPluginName = toConnectionName.plugin.label || toConnectionName.name;
            toConnectionName = toPluginName;
          }

          connection.from = fromConnectionName;
          connection.to = toConnectionName;
        });
        config.connections = connections; // Adding leftover nodes

        if (Object.keys(nodesMap).length !== 0) {
          angular.forEach(nodesMap, function (node, id) {
            addPluginToConfig(node, id);
          });
        }

        var appType = this.getAppType(); // Resources

        config.resources = {
          memoryMB: this.getMemoryMB(),
          virtualCores: this.getVirtualCores()
        };
        config.driverResources = {
          memoryMB: this.getDriverMemoryMB(),
          virtualCores: this.getDriverVirtualCores()
        };

        if (this.GLOBALS.etlBatchPipelines.includes(appType)) {
          config.schedule = this.getSchedule();
          config.engine = this.getEngine();
          config.properties = this.getProperties();
          config.stageLoggingEnabled = this.getStageLogging();
          config.processTimingEnabled = this.getInstrumentation();
          config.numOfRecordsPreview = this.getNumRecordsPreview();
          config.rangeRecordsPreview = this.getRangeRecordsPreview();
        } else if (appType === this.GLOBALS.etlRealtime) {
          config.instances = this.getInstance();
        } else if (appType === this.GLOBALS.etlDataStreams) {
          config.batchInterval = this.getBatchInterval();
          config.clientResources = {
            memoryMB: this.getClientMemoryMB(),
            virtualCores: this.getClientVirtualCores()
          };
          config.properties = this.getProperties();
          config.stageLoggingEnabled = this.getStageLogging();
          config.processTimingEnabled = this.getInstrumentation();
          config.disableCheckpoints = this.getCheckpointing();

          if (!config.disableCheckpoints) {
            config.checkpointDir = this.getCheckpointDir();
          }

          config.stopGracefully = this.getGracefulStop();
        } else if (appType === this.GLOBALS.eltSqlPipeline) {
          config.schedule = this.getSchedule();
          config.serviceAccountPath = this.getServiceAccountPath();
          config.clientResources = {
            memoryMB: this.getClientMemoryMB(),
            virtualCores: this.getClientVirtualCores()
          };
        }

        config.comments = this.getComments();

        if (this.state.description) {
          config.description = this.state.description;
        } // Removing UUID from postactions name


        var postActions = this.getPostActions();
        postActions = _.sortBy(postActions, function (action) {
          return action.plugin.name;
        });
        var currCount = 0;
        var currAction = '';
        angular.forEach(postActions, function (action) {
          if (action.plugin.name !== currAction) {
            currAction = action.plugin.name;
            currCount = 1;
          } else {
            currCount++;
          }

          action.name = action.plugin.name + '-' + currCount;
        });
        config.postActions = postActions;
        config.maxConcurrentRuns = this.getMaxConcurrentRuns();
        return config;
      }
    }, {
      key: "getConfigForExport",
      value: function getConfigForExport() {
        var configOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var state = this.getState(); // Stripping of uuids and generating configs is what is going on here.

        var config = angular.copy(this.generateConfigFromState());

        if (typeof configOptions.shouldPruneProperties === 'undefined') {
          configOptions.shouldPruneProperties = true;
        }

        if (configOptions.shouldPruneProperties) {
          /**
           * If the pipeline is saved as draft we don't want to prune properties
           * The empty properties are needed to understand the defaults the user wants
           * to override when publishing the pipeline.
           */
          this.HydratorPlusPlusCanvasFactory.pruneProperties(config);
        }

        state.config = angular.copy(config);
        var nodes = angular.copy(this.getNodes()).map(function (node) {
          node.name = node.plugin.label;
          return node;
        });
        state.__ui__.nodes = nodes;
        return angular.copy(state);
      }
    }, {
      key: "getCloneConfig",
      value: function getCloneConfig() {
        return this.getConfigForExport();
      }
    }, {
      key: "getDisplayConfig",
      value: function getDisplayConfig() {
        var uniqueNodeNames = {};
        this.HydratorPlusPlusConsoleActions.resetMessages();
        this.NonStorePipelineErrorFactory.isUniqueNodeNames(this.getNodes(), function (err, node) {
          if (err) {
            uniqueNodeNames[node.plugin.label] = err;
          }
        });

        if (Object.keys(uniqueNodeNames).length > 0) {
          return false;
        }

        var stateCopy = this.getConfigForExport();
        angular.forEach(stateCopy.config.stages, function (node) {
          if (node.plugin) {
            delete node.outputSchema;
            delete node.inputSchema;
          }
        });
        delete stateCopy.__ui__;
        return stateCopy;
      }
    }, {
      key: "getDescription",
      value: function getDescription() {
        return this.getState().description;
      }
    }, {
      key: "getName",
      value: function getName() {
        return this.getState().name;
      }
    }, {
      key: "getIsStateDirty",
      value: function getIsStateDirty() {
        var defaults = this.getDefaults();
        var state = this.getState();
        return !angular.equals(defaults, state);
      }
    }, {
      key: "setName",
      value: function setName(name) {
        this.state.name = name;
        this.emitChange();
      }
    }, {
      key: "setDescription",
      value: function setDescription(description) {
        this.state.description = description;
        this.emitChange();
      }
    }, {
      key: "setMetadataInformation",
      value: function setMetadataInformation(name, description) {
        this.state.name = name;
        this.state.description = description;
        this.emitChange();
      }
    }, {
      key: "setConfig",
      value: function setConfig(config, type) {
        switch (type) {
          case 'source':
            this.state.config.source = config;
            break;

          case 'sink':
            this.state.config.sinks.push(config);
            break;

          case 'transform':
            this.state.config.transforms.push(config);
            break;
        }

        this.emitChange();
      }
    }, {
      key: "setEngine",
      value: function setEngine(engine) {
        this.state.config.engine = engine || this.HYDRATOR_DEFAULT_VALUES.engine;
      }
    }, {
      key: "getEngine",
      value: function getEngine() {
        return this.state.config.engine || this.HYDRATOR_DEFAULT_VALUES.engine;
      }
    }, {
      key: "getProperties",
      value: function getProperties() {
        return this.getConfig().properties;
      }
    }, {
      key: "setProperties",
      value: function setProperties(properties) {
        var _this3 = this;

        var numExecutorKey = window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES;
        var numExecutorOldKey = window.CaskCommon.PipelineConfigConstants.DEPRECATED_SPARK_MASTER;
        var backPressureKey = window.CaskCommon.PipelineConfigConstants.SPARK_BACKPRESSURE_ENABLED;

        if (typeof properties !== 'undefined' && Object.keys(properties).length > 0) {
          this.state.config.properties = properties;
        } else {
          this.state.config.properties = {};
        }

        if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          if (typeof this.state.config.properties[backPressureKey] === 'undefined') {
            this.state.config.properties[backPressureKey] = true;
          }
        }

        if (this.getEngine() === window.CaskCommon.PipelineConfigConstants.ENGINE_OPTIONS.SPARK || this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          if (this.state.config.properties.hasOwnProperty(numExecutorOldKey)) {
            // format on standalone is 'local[{number}] === local[2]'
            // So the magic number 6 here is for skipping 'local[' and get the number
            var numOfExecutors = this.state.config.properties[numExecutorOldKey];
            numOfExecutors = typeof numOfExecutors === 'string' ? numOfExecutors.substring(6, numOfExecutors.length - 1) : numOfExecutors.toString();
            this.state.config.properties[numExecutorKey] = numOfExecutors;
            delete this.state.config.properties[numExecutorOldKey];
          }
        }

        this.state.config.properties = Object.keys(this.state.config.properties).reduce(function (obj, key) {
          return obj[key] = _this3.state.config.properties[key].toString(), obj;
        }, {});
      }
    }, {
      key: "getCustomConfig",
      value: function getCustomConfig() {
        var customConfig = {}; // We hide these two properties from showing up in key value pairs in realtime pipeline
        // In batch if the engine is spark we should not hide these properties. We should show
        // the custom properties

        var managedProperties = [];

        if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          managedProperties = [window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES, window.CaskCommon.PipelineConfigConstants.SPARK_BACKPRESSURE_ENABLED];
        } else if (window.CDAP_UI_THEME.features['allow-force-dynamic-execution'] && this.state.config.properties.hasOwnProperty(window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION)) {
          if (this.state.config.properties[window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION] === 'true') {
            managedProperties = [window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION, window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING];
          } else {
            managedProperties = [window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION, window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES];
          }
        }

        for (var key in this.state.config.properties) {
          if (this.state.config.properties.hasOwnProperty(key) && managedProperties.indexOf(key) === -1) {
            customConfig[key] = this.state.config.properties[key];
          }
        }

        return customConfig;
      }
    }, {
      key: "getCustomConfigForDisplay",
      value: function getCustomConfigForDisplay() {
        var currentCustomConfig = this.getCustomConfig();
        var customConfigForDisplay = {};

        for (var key in currentCustomConfig) {
          if (currentCustomConfig.hasOwnProperty(key)) {
            var newKey = key;

            if (key.startsWith('system.mapreduce.')) {
              newKey = newKey.slice(17);
            } else if (key.startsWith('system.spark.')) {
              newKey = newKey.slice(13);
            }

            customConfigForDisplay[newKey] = currentCustomConfig[key];
          }
        }

        return customConfigForDisplay;
      }
    }, {
      key: "setCustomConfig",
      value: function setCustomConfig(customConfig) {
        // have to do this because oldCustomConfig is already part of this.state.config.properties
        var oldCustomConfig = this.getCustomConfig();

        for (var oldKey in oldCustomConfig) {
          if (oldCustomConfig.hasOwnProperty(oldKey) && this.state.config.properties.hasOwnProperty(oldKey)) {
            delete this.state.config.properties[oldKey];
          }
        }

        var newCustomConfig = {};

        for (var configKey in customConfig) {
          if (customConfig.hasOwnProperty(configKey)) {
            var newKey = configKey;

            if (this.GLOBALS.etlBatchPipelines.includes(this.state.artifact.name) && this.getEngine() === 'mapreduce') {
              newKey = 'system.mapreduce.' + configKey;
            } else {
              newKey = 'system.spark.' + configKey;
            }

            newCustomConfig[newKey] = customConfig[configKey];
          }
        }

        angular.extend(this.state.config.properties, newCustomConfig);
      }
    }, {
      key: "getBackpressure",
      value: function getBackpressure() {
        return this.myHelpers.objectQuery(this.state, 'config', 'properties', 'system.spark.spark.streaming.backpressure.enabled');
      }
    }, {
      key: "setBackpressure",
      value: function setBackpressure(val) {
        if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          this.state.config.properties['system.spark.spark.streaming.backpressure.enabled'] = val;
        }
      }
    }, {
      key: "getNumExecutors",
      value: function getNumExecutors() {
        if (this.myHelpers.objectQuery(this.state, 'config', 'properties', window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES)) {
          return this.state.config.properties[window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES].toString();
        }

        return '1';
      }
    }, {
      key: "setNumExecutors",
      value: function setNumExecutors(num) {
        this.state.config.properties[window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES] = num;
      }
    }, {
      key: "getInstrumentation",
      value: function getInstrumentation() {
        return this.getConfig().processTimingEnabled;
      }
    }, {
      key: "setInstrumentation",
      value: function setInstrumentation() {
        var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        this.state.config.processTimingEnabled = val;
      }
    }, {
      key: "getStageLogging",
      value: function getStageLogging() {
        return this.getConfig().stageLoggingEnabled;
      }
    }, {
      key: "setStageLogging",
      value: function setStageLogging() {
        var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        this.state.config.stageLoggingEnabled = val;
      }
    }, {
      key: "getCheckpointing",
      value: function getCheckpointing() {
        return this.getConfig().disableCheckpoints;
      }
    }, {
      key: "setCheckpointing",
      value: function setCheckpointing() {
        var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        this.state.config.disableCheckpoints = val;
      }
    }, {
      key: "getCheckpointDir",
      value: function getCheckpointDir() {
        return this.getConfig().checkpointDir;
      }
    }, {
      key: "setCheckpointDir",
      value: function setCheckpointDir(val) {
        if (val !== false) {
          this.state.config.checkpointDir = val;
        } else {
          this.state.config.checkpointDir = '';
        }
      }
    }, {
      key: "getGracefulStop",
      value: function getGracefulStop() {
        return this.getConfig().stopGracefully;
      }
    }, {
      key: "setGracefulStop",
      value: function setGracefulStop() {
        var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        this.state.config.stopGracefully = val;
      }
    }, {
      key: "getNumRecordsPreview",
      value: function getNumRecordsPreview() {
        return this.getConfig().numOfRecordsPreview;
      }
    }, {
      key: "setNumRecordsPreview",
      value: function setNumRecordsPreview() {
        var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.HYDRATOR_DEFAULT_VALUES.numOfRecordsPreview;

        if (this.GLOBALS.etlBatchPipelines.includes(this.state.artifact.name)) {
          // Cap preview at configured max, if there is one
          var _this$getRangeRecords = this.getRangeRecordsPreview(),
              max = _this$getRangeRecords.max;

          this.state.config.numOfRecordsPreview = Math.min(max, val);
        }
      }
    }, {
      key: "getRangeRecordsPreview",
      value: function getRangeRecordsPreview() {
        return this.getConfig().rangeRecordsPreview;
      }
    }, {
      key: "setRangeRecordsPreview",
      value: function setRangeRecordsPreview(_ref) {
        var _ref$minRecordsPrevie = _ref.minRecordsPreview,
            minRecordsPreview = _ref$minRecordsPrevie === void 0 ? this.HYDRATOR_DEFAULT_VALUES.minRecordsPreview : _ref$minRecordsPrevie,
            _ref$maxRecordsPrevie = _ref.maxRecordsPreview,
            maxRecordsPreview = _ref$maxRecordsPrevie === void 0 ? window.CDAP_CONFIG.cdap.maxRecordsPreview || this.HYDRATOR_DEFAULT_VALUES.maxRecordsPreview : _ref$maxRecordsPrevie;

        if (this.GLOBALS.etlBatchPipelines.includes(this.state.artifact.name)) {
          this.state.config.rangeRecordsPreview = {
            min: minRecordsPreview,
            max: maxRecordsPreview
          };
        }
      }
    }, {
      key: "setArtifact",
      value: function setArtifact(artifact) {
        this.state.artifact.name = artifact.name;
        this.state.artifact.version = artifact.version;
        this.state.artifact.scope = artifact.scope;

        if (this.GLOBALS.etlBatchPipelines.includes(artifact.name)) {
          this.state.config.schedule = this.state.config.schedule || this.HYDRATOR_DEFAULT_VALUES.schedule;
        } else if (artifact.name === this.GLOBALS.etlRealtime) {
          this.state.config.instances = this.state.config.instances || this.HYDRATOR_DEFAULT_VALUES.instance;
        } else if (artifact.name === this.GLOBALS.eltSqlPipeline) {
          this.state.config.schedule = this.state.config.schedule || this.HYDRATOR_DEFAULT_VALUES.schedule;
        }

        this.emitChange();
      }
    }, {
      key: "setNodes",
      value: function setNodes(nodes) {
        var _this4 = this;

        this.state.__ui__.nodes = nodes || [];
        var listOfPromises = [];

        var parseNodeConfig = function parseNodeConfig(node, res) {
          var nodeConfig = _this4.HydratorPlusPlusPluginConfigFactory.generateNodeConfig(node._backendProperties, res);

          node.implicitSchema = nodeConfig.outputSchema.implicitSchema;
          node.outputSchemaProperty = nodeConfig.outputSchema.outputSchemaProperty;

          if (angular.isArray(node.outputSchemaProperty)) {
            node.outputSchemaProperty = node.outputSchemaProperty[0];
            node.watchProperty = nodeConfig.outputSchema.schemaProperties['property-watch'];
          }

          if (node.outputSchemaProperty) {
            node.outputSchema = node.plugin.properties[node.outputSchemaProperty];
          }

          if (nodeConfig.outputSchema.implicitSchema) {
            var outputSchema = _this4.HydratorPlusPlusHydratorService.formatSchemaToAvro(nodeConfig.outputSchema.implicitSchema);

            node.outputSchema = outputSchema;
          }

          if (!node.outputSchema && nodeConfig.outputSchema.schemaProperties['default-schema']) {
            node.outputSchema = JSON.stringify(nodeConfig.outputSchema.schemaProperties['default-schema']);
            node.plugin.properties[node.outputSchemaProperty] = node.outputSchema;
          }

          node.configGroups = res['configuration-groups'];
          node.outputs = res['outputs'];
          node.filters = res['filters'];
        };

        if (this.state.__ui__.nodes && this.state.__ui__.nodes.length) {
          this.state.__ui__.nodes.filter(function (n) {
            return !n._backendProperties;
          }).forEach(function (n) {
            listOfPromises.push(_this4.HydratorPlusPlusHydratorService.fetchBackendProperties(n, _this4.getAppType()));
          });
        } else {
          listOfPromises.push(this.$q.when(true));
        }

        if (listOfPromises.length) {
          this.$q.all(listOfPromises).then(function () {
            if (!_this4.validateState()) {
              _this4.emitChange();
            } // Once the backend properties are fetched for all nodes, fetch their config jsons.
            // This will be used for schema propagation where we import/use a predefined app/open a published pipeline
            // the user should directly click on the last node and see what is the incoming schema
            // without having to open the subsequent nodes.


            var reqBody = [];

            _this4.state.__ui__.nodes.forEach(function (n) {
              // This could happen when the user doesn't provide an artifact information for a plugin & deploys it
              // using CLI or REST and opens up in UI and clones it. Without this check it will throw a JS error.
              if (!n.plugin || !n.plugin.artifact) {
                return;
              }

              var pluginInfo = {
                name: n.plugin.artifact.name,
                version: n.plugin.artifact.version,
                scope: n.plugin.artifact.scope,
                properties: ["widgets.".concat(n.plugin.name, "-").concat(n.type)]
              };
              reqBody.push(pluginInfo);
            });

            _this4.myPipelineApi.fetchAllPluginsProperties({
              namespace: _this4.$stateParams.namespace
            }, reqBody).$promise.then(function (resInfo) {
              resInfo.forEach(function (pluginInfo, index) {
                var pluginProperties = Object.keys(pluginInfo.properties);

                if (pluginProperties.length === 0) {
                  return;
                }

                try {
                  var config = JSON.parse(pluginInfo.properties[pluginProperties[0]]);
                  parseNodeConfig(_this4.state.__ui__.nodes[index], config);
                } catch (e) {// no-op
                }
              });

              _this4.validateState();
            });
          }, function (err) {
            console.log('ERROR fetching backend properties for nodes', err);

            _this4.validateState();
          });
        }
      }
    }, {
      key: "setConnections",
      value: function setConnections(connections) {
        this.state.config.connections = connections;
      } // This is for the user to forcefully propagate the output schema of a node
      // down the stream to all its connections.
      // Its a simple BFS down the graph to propagate the schema. Right now it doesn't catch cycles.
      // The assumption there are no cycles in the dag we create.

    }, {
      key: "propagateIOSchemas",
      value: function propagateIOSchemas(pluginId) {
        var _this5 = this;

        var adjacencyMap = {},
            nodesMap = {},
            outputSchema,
            schema,
            connections = this.state.config.connections;

        this.state.__ui__.nodes.forEach(function (node) {
          return nodesMap[node.name] = node;
        });

        connections.forEach(function (conn) {
          if (Array.isArray(adjacencyMap[conn.from])) {
            adjacencyMap[conn.from].push(conn.to);
          } else {
            adjacencyMap[conn.from] = [conn.to];
          }
        });

        var traverseMap = function traverseMap(targetNodes, outputSchema, inputSchema) {
          if (!targetNodes) {
            return;
          }

          targetNodes.forEach(function (n) {
            if (!_this5.HydratorPlusPlusNodeService.shouldPropagateSchemaToNode(nodesMap[n])) {
              return;
            }

            var schemaToPropagate = outputSchema;

            if (nodesMap[n].type === 'errortransform') {
              schemaToPropagate = inputSchema;
            }

            nodesMap[n].outputSchema = schemaToPropagate;
            nodesMap[n].inputSchema = schemaToPropagate;

            if (nodesMap[n].outputSchemaProperty) {
              nodesMap[n].plugin.properties[nodesMap[n].outputSchemaProperty] = schemaToPropagate;
            }

            traverseMap(adjacencyMap[n], schemaToPropagate, schemaToPropagate);
          });
        };

        outputSchema = nodesMap[pluginId].outputSchema;
        var inputSchema = nodesMap[pluginId].inputSchema && Array.isArray(nodesMap[pluginId].inputSchema) && nodesMap[pluginId].inputSchema.length ? nodesMap[pluginId].inputSchema[0].schema : nodesMap[pluginId].inputSchema;

        try {
          // We need this type check because of the way we store schemas right now.
          // After we refactor then there should be a consistent format for all the schemas.
          if (Array.isArray(outputSchema)) {
            schema = JSON.parse(outputSchema[0].schema);
          } else if (typeof outputSchema === 'string') {
            schema = JSON.parse(outputSchema);
          }

          schema.fields = schema.fields.map(function (field) {
            delete field.readonly;
            return field;
          });
          outputSchema = [this.HydratorPlusPlusNodeService.getOutputSchemaObj(JSON.stringify(schema))];
        } catch (e) {
          console.log('Failed to parse output schema of plugin: ', pluginId);
        }

        traverseMap(adjacencyMap[pluginId], JSON.stringify(schema), inputSchema);
      }
    }, {
      key: "getNodes",
      value: function getNodes() {
        return this.getState().__ui__.nodes;
      }
    }, {
      key: "getStages",
      value: function getStages() {
        return this.getState().config.stages || [];
      }
    }, {
      key: "getSourceConnections",
      value: function getSourceConnections(nodeId) {
        return this.state.config.connections.filter(function (conn) {
          return conn.to === nodeId;
        });
      }
    }, {
      key: "getSourceNodes",
      value: function getSourceNodes(nodeId) {
        var nodesMap = {};

        this.state.__ui__.nodes.forEach(function (node) {
          return nodesMap[node.name] = node;
        });

        return this.getSourceConnections(nodeId).map(function (matchedConnection) {
          return nodesMap[matchedConnection.from];
        });
      }
    }, {
      key: "editNodeProperties",
      value: function editNodeProperties(nodeId, nodeConfig) {
        var nodes = this.state.__ui__.nodes;
        var match = nodes.filter(function (node) {
          return node.name === nodeId;
        });

        if (match.length) {
          match = match[0];
          angular.forEach(nodeConfig, function (pValue, pName) {
            return match[pName] = pValue;
          });

          if (!this.validateState()) {
            this.emitChange();
          }
        }
      }
    }, {
      key: "getSchedule",
      value: function getSchedule() {
        return this.getState().config.schedule;
      }
    }, {
      key: "getDefaultSchedule",
      value: function getDefaultSchedule() {
        return this.HYDRATOR_DEFAULT_VALUES.schedule;
      }
    }, {
      key: "setSchedule",
      value: function setSchedule(schedule) {
        this.state.config.schedule = schedule;
      }
    }, {
      key: "validateState",
      value: function validateState(validationConfig) {
        var _this6 = this;

        if (!validationConfig) {
          validationConfig = {
            showConsoleMessage: false,
            validateBeforePreview: false
          };
        }

        var isStateValid = true;
        var name = this.getName();
        var errorFactory = this.NonStorePipelineErrorFactory;
        var daglevelvalidation = [errorFactory.hasAtleastOneSource, errorFactory.hasAtLeastOneSink];
        var nodes = this.state.__ui__.nodes;
        var connections = angular.copy(this.state.config.connections); //resetting any existing errors or warnings

        nodes.forEach(function (node) {
          node.errorCount = 0;
          delete node.warning;
          delete node.error;
        });
        var errors = [];
        this.HydratorPlusPlusConsoleActions.resetMessages();

        var setErrorWarningFlagOnNode = function setErrorWarningFlagOnNode(node) {
          if (node.error) {
            delete node.warning;
          } else {
            node.warning = true;
          }

          if (validationConfig.showConsoleMessage) {
            node.error = true;
            delete node.warning;
          }
        };
        /**
         * A pipeline consisting of only custom actions is a valid pipeline,
         * so we are skipping the at least 1 source and sink check
         **/


        var countActions = nodes.filter(function (node) {
          return _this6.GLOBALS.pluginConvert[node.type] === 'action';
        }).length;

        if (countActions !== nodes.length || nodes.length === 0) {
          daglevelvalidation.forEach(function (validationFn) {
            validationFn(nodes, function (err, node) {
              if (err) {
                isStateValid = false;

                if (node) {
                  node.errorCount += 1;
                  setErrorWarningFlagOnNode(node);
                }

                errors.push({
                  type: err
                });
              }
            });
          });
        }

        if (!validationConfig.validateBeforePreview) {
          errorFactory.hasValidName(name, function (err) {
            if (err) {
              isStateValid = false;
              errors.push({
                type: err
              });
            }
          });
        }

        errorFactory.hasNoBackendProperties(nodes, function (errorNodes) {
          if (errorNodes) {
            isStateValid = false;
            errorNodes.forEach(function (node) {
              node.error = true;
              node.errorCount += 1;
              setErrorWarningFlagOnNode(node);
            });
            errors.push({
              type: 'NO-BACKEND-PROPS',
              payload: {
                nodes: errorNodes.map(function (node) {
                  return node.name || node.plugin.name;
                })
              }
            });
          }
        }); // compute field visibility so that required field validation will be done accordingly.

        nodes.forEach(function (node) {
          var visibilityMap = {};

          if (node.configGroups && node._backendProperties && node.plugin.properties) {
            try {
              var filteredConfigGroups = _this6.HydratorPlusPlusPluginConfigFactory.dynamicFiltersUtilities.filterByCondition(node.configGroups, node, node._backendProperties, node.plugin.properties);

              visibilityMap = filteredConfigGroups.reduce(function (fieldsMap, group) {
                group.properties.forEach(function (property) {
                  fieldsMap[property.name] = property.show;
                });
                return fieldsMap;
              }, {});

              if (node._backendProperties.connection) {
                node._backendProperties.connection.required = node.plugin.properties.useConnection === 'true';
              }
            } catch (e) {}
          }

          node.visibilityMap = visibilityMap;
        });
        errorFactory.isRequiredFieldsFilled(nodes, function (err, node, unFilledRequiredFields) {
          if (err) {
            isStateValid = false;
            node.warning = true;
            node.errorCount += unFilledRequiredFields;
            setErrorWarningFlagOnNode(node);
          }
        });
        errorFactory.isUniqueNodeNames(nodes, function (err, node) {
          if (err) {
            isStateValid = false;
            node.errorCount += 1;
            setErrorWarningFlagOnNode(node);
          }
        });
        var strayNodes = [];
        errorFactory.allNodesConnected(nodes, connections, function (errorNode) {
          if (errorNode) {
            isStateValid = false;
            strayNodes.push(errorNode);
          }
        });

        if (strayNodes.length) {
          errors.push({
            type: 'STRAY-NODES',
            payload: {
              nodes: strayNodes
            }
          });
        }

        var invalidConnections = [];
        errorFactory.allConnectionsValid(nodes, connections, function (errorConnection) {
          if (errorConnection) {
            isStateValid = false;
            invalidConnections.push(errorConnection);
          }
        });

        if (invalidConnections.length) {
          errors.push({
            type: 'INVALID-CONNECTIONS',
            payload: {
              connections: invalidConnections
            }
          });
        }

        errorFactory.hasValidResources(this.state.config, function (err) {
          if (err) {
            isStateValid = false;
            errors.push({
              type: 'error',
              content: _this6.GLOBALS.en.hydrator.studio.error[err]
            });
          }
        });
        errorFactory.hasValidDriverResources(this.state.config, function (err) {
          if (err) {
            isStateValid = false;
            errors.push({
              type: 'error',
              content: _this6.GLOBALS.en.hydrator.studio.error[err]
            });
          }
        });

        if (this.state.artifact.name === this.GLOBALS.etlDataStreams) {
          errorFactory.hasValidClientResources(this.state.config, function (err) {
            if (err) {
              isStateValid = false;
              errors.push({
                type: 'error',
                content: _this6.GLOBALS.en.hydrator.studio.error[err]
              });
            }
          });
        }

        if (errors.length && validationConfig.showConsoleMessage) {
          this.HydratorPlusPlusConsoleActions.addMessage(errors);
        }

        return isStateValid;
      }
    }, {
      key: "getBatchInterval",
      value: function getBatchInterval() {
        return this.getState().config.batchInterval;
      }
    }, {
      key: "setBatchInterval",
      value: function setBatchInterval(interval) {
        this.state.config.batchInterval = interval || angular.copy(this.HYDRATOR_DEFAULT_VALUES.batchInterval);
      }
    }, {
      key: "getInstance",
      value: function getInstance() {
        return this.getState().config.instances;
      }
    }, {
      key: "setInstance",
      value: function setInstance(instances) {
        this.state.config.instances = instances;
      }
    }, {
      key: "setDriverResources",
      value: function setDriverResources(driverResources) {
        this.state.config.driverResources = driverResources || angular.copy(this.HYDRATOR_DEFAULT_VALUES.resources);
      }
    }, {
      key: "setResources",
      value: function setResources(resources) {
        this.state.config.resources = resources || angular.copy(this.HYDRATOR_DEFAULT_VALUES.resources);
      }
    }, {
      key: "setClientResources",
      value: function setClientResources(clientResources) {
        this.state.config.clientResources = clientResources || angular.copy(this.HYDRATOR_DEFAULT_VALUES.resources);
      }
    }, {
      key: "setDriverVirtualCores",
      value: function setDriverVirtualCores(virtualCores) {
        this.state.config.driverResources = this.state.config.driverResources || {};
        this.state.config.driverResources.virtualCores = virtualCores;
      }
    }, {
      key: "getDriverVirtualCores",
      value: function getDriverVirtualCores() {
        return this.myHelpers.objectQuery(this.state, 'config', 'driverResources', 'virtualCores');
      }
    }, {
      key: "getDriverMemoryMB",
      value: function getDriverMemoryMB() {
        return this.myHelpers.objectQuery(this.state, 'config', 'driverResources', 'memoryMB');
      }
    }, {
      key: "setDriverMemoryMB",
      value: function setDriverMemoryMB(memoryMB) {
        this.state.config.driverResources = this.state.config.driverResources || {};
        this.state.config.driverResources.memoryMB = memoryMB;
      }
    }, {
      key: "setVirtualCores",
      value: function setVirtualCores(virtualCores) {
        this.state.config.resources = this.state.config.resources || {};
        this.state.config.resources.virtualCores = virtualCores;
      }
    }, {
      key: "getVirtualCores",
      value: function getVirtualCores() {
        return this.myHelpers.objectQuery(this.state, 'config', 'resources', 'virtualCores');
      }
    }, {
      key: "getMemoryMB",
      value: function getMemoryMB() {
        return this.myHelpers.objectQuery(this.state, 'config', 'resources', 'memoryMB');
      }
    }, {
      key: "setMemoryMB",
      value: function setMemoryMB(memoryMB) {
        this.state.config.resources = this.state.config.resources || {};
        this.state.config.resources.memoryMB = memoryMB;
      }
    }, {
      key: "setClientVirtualCores",
      value: function setClientVirtualCores(virtualCores) {
        this.state.config.clientResources = this.state.config.clientResources || {};
        this.state.config.clientResources.virtualCores = virtualCores;
      }
    }, {
      key: "getClientVirtualCores",
      value: function getClientVirtualCores() {
        return this.myHelpers.objectQuery(this.state, 'config', 'clientResources', 'virtualCores');
      }
    }, {
      key: "getClientMemoryMB",
      value: function getClientMemoryMB() {
        return this.myHelpers.objectQuery(this.state, 'config', 'clientResources', 'memoryMB');
      }
    }, {
      key: "setClientMemoryMB",
      value: function setClientMemoryMB(memoryMB) {
        this.state.config.clientResources = this.state.config.clientResources || {};
        this.state.config.clientResources.memoryMB = memoryMB;
      }
    }, {
      key: "setComments",
      value: function setComments(comments) {
        this.state.config.comments = comments;
      }
    }, {
      key: "getComments",
      value: function getComments() {
        return this.getState().config.comments;
      }
    }, {
      key: "addPostAction",
      value: function addPostAction(config) {
        if (!this.state.config.postActions) {
          this.state.config.postActions = [];
        }

        this.state.config.postActions.push(config);
        this.emitChange();
      }
    }, {
      key: "editPostAction",
      value: function editPostAction(config) {
        var index = _.findLastIndex(this.state.config.postActions, function (post) {
          return post.id === config.id;
        });

        this.state.config.postActions[index] = config;
        this.emitChange();
      }
    }, {
      key: "deletePostAction",
      value: function deletePostAction(config) {
        _.remove(this.state.config.postActions, function (post) {
          return post.id === config.id;
        });

        this.emitChange();
      }
    }, {
      key: "getPostActions",
      value: function getPostActions() {
        return this.getState().config.postActions;
      }
    }, {
      key: "getMaxConcurrentRuns",
      value: function getMaxConcurrentRuns() {
        return this.getState().config.maxConcurrentRuns;
      }
    }, {
      key: "setMaxConcurrentRuns",
      value: function setMaxConcurrentRuns() {
        var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        this.state.config.maxConcurrentRuns = num;
      }
    }, {
      key: "setServiceAccountPath",
      value: function setServiceAccountPath(path) {
        this.state.config.serviceAccountPath = path;
      }
    }, {
      key: "getServiceAccountPath",
      value: function getServiceAccountPath() {
        return this.getState().config.serviceAccountPath;
      }
    }, {
      key: "setForceDynamicExecution",
      value: function setForceDynamicExecution(forceDynamicExecution) {
        var keysToClear = [window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION, window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING, window.CaskCommon.PipelineConfigConstants.SPARK_EXECUTOR_INSTANCES];

        for (var _i = 0, _keysToClear = keysToClear; _i < _keysToClear.length; _i++) {
          var key = _keysToClear[_i];

          if (this.state.config.properties.hasOwnProperty(key)) {
            delete this.state.config.properties[key];
          }
        }

        var newCustomConfig = {};

        if (forceDynamicExecution === this.GLOBALS.dynamicExecutionForceOn) {
          newCustomConfig[window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION] = 'true';
          newCustomConfig[window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING] = 'true';
        } else if (forceDynamicExecution === this.GLOBALS.dynamicExecutionForceOff) {
          newCustomConfig[window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION] = 'false';
        }

        angular.extend(this.state.config.properties, newCustomConfig);
      }
    }, {
      key: "getForceDynamicExecution",
      value: function getForceDynamicExecution() {
        if (window.CDAP_UI_THEME.features['allow-force-dynamic-execution']) {
          if (this.state.config.properties.hasOwnProperty(window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION)) {
            if (this.state.config.properties[window.CaskCommon.PipelineConfigConstants.SPARK_DYNAMIC_ALLOCATION] === 'true') {
              return this.GLOBALS.dynamicExecutionForceOn;
            } else {
              return this.GLOBALS.dynamicExecutionForceOff;
            }
          }
        }

        return '';
      }
    }, {
      key: "saveAsDraft",
      value: function saveAsDraft() {
        var _this7 = this;

        this.HydratorPlusPlusConsoleActions.resetMessages();
        var name = this.getName();
        var isValidName = true;
        var errorFactory = this.NonStorePipelineErrorFactory;
        errorFactory.hasValidName(name, function (err) {
          if (err) {
            isValidName = false;
          }
        });

        if (!name.length || !isValidName) {
          this.HydratorPlusPlusConsoleActions.addMessage([{
            type: 'MISSING-NAME'
          }]);
          return;
        }

        var config = this.getConfigForExport({
          shouldPruneProperties: false
        });
        var draftId = this.getDraftId() || this.uuid.v4();
        var params = {
          context: this.$stateParams.namespace,
          draftId: draftId
        };
        /**
         * If the user is editing draft that is using old user store, then we
         * remove it from old user store and save it in the new drafts API.
         *
         * This is to migrate the draft to using new drafts API.
         */

        this.mySettings.get('hydratorDrafts', true).then(function (res) {
          var savedDraft = _this7.myHelpers.objectQuery(res, _this7.$stateParams.namespace, draftId);

          if (savedDraft) {
            delete res[_this7.$stateParams.namespace][draftId];
            return _this7.mySettings.set('hydratorDrafts', res);
          }
        }).then(function () {
          return _this7.myPipelineApi.saveDraft(params, config).$promise;
        }).then(function () {
          _this7.$stateParams.draftId = draftId;

          _this7.$state.go('hydrator.create', _this7.$stateParams, {
            notify: false
          });

          _this7.HydratorPlusPlusConsoleActions.addMessage([{
            type: 'success',
            content: "Draft ".concat(config.name, " saved successfully.")
          }]);

          _this7.__defaultState = angular.copy(_this7.state);

          _this7.emitChange();
        }, function (err) {
          var message = err;

          if (err && (err.data || err.response)) {
            message = err.data || err.response;
          }

          if (err && (err.statusCode === 404 || err.statusCode === 503)) {
            message = 'Unable to communicate with the Pipeline Studio service. Please check the service status.';
          }

          _this7.HydratorPlusPlusConsoleActions.addMessage([{
            type: 'error',
            content: message
          }]);
        });
      }
    }, {
      key: "publishPipeline",
      value: function publishPipeline() {
        var _this8 = this;

        this.HydratorPlusPlusConsoleActions.resetMessages();
        var error = this.validateState({
          showConsoleMessage: true
        });

        if (!error) {
          return;
        }

        this.EventPipe.emit('showLoadingIcon', 'Deploying Pipeline...');

        var navigateToDetailedView = function navigateToDetailedView(adapterName) {
          _this8.EventPipe.emit('hideLoadingIcon.immediate');

          _this8.setState(_this8.getDefaults());

          _this8.$state.go('hydrator.detail', {
            pipelineId: adapterName
          });
        };

        var draftDeleteErrorHandler = function draftDeleteErrorHandler(err) {
          _this8.HydratorPlusPlusConsoleActions.addMessage([{
            type: 'error',
            content: err
          }]);

          return _this8.$q.reject(false);
        };

        var removeOldDraft = function removeOldDraft(draftId, adapterName, res) {
          if (res.statusCode !== 404) {
            return draftDeleteErrorHandler.bind(_this8, res.response || res.data);
          }

          _this8.mySettings.get('hydratorDrafts', true).then(function (res) {
            var savedDraft = _this8.myHelpers.objectQuery(res, _this8.$stateParams.namespace, draftId);

            if (savedDraft) {
              delete res[_this8.$stateParams.namespace][draftId];
              return _this8.mySettings.set('hydratorDrafts', res);
            }

            return Promise.resolve(true);
          }, draftDeleteErrorHandler.bind(_this8)).then(navigateToDetailedView.bind(_this8, adapterName));
        };

        var removeFromUserDrafts = function removeFromUserDrafts(adapterName) {
          var draftId = _this8.getDraftId();

          if (!draftId) {
            return navigateToDetailedView.call(_this8, adapterName);
          }
          /**
           * Remove the draft from the new API. If it errors out check if it is
           * a 404.
           * - If it is 404 so it should be an older draft. Delete from the user store
           * - If it is non-404 not show the error message. This is less likely to happen as
           *   pipeline publish succeeds but draft delete fails (network timeout issue).
           *   TODO: We should show a navigate anyway link to discard the draft and navigate to published
           *   pipeline view.
           * - If it succeeds then proceed to pipeline detailed view.
           */


          _this8.myPipelineApi.deleteDraft({
            context: _this8.$stateParams.namespace,
            draftId: draftId
          }).$promise.then(navigateToDetailedView.bind(_this8, adapterName), removeOldDraft.bind(_this8, draftId, adapterName));
        };

        var publish = function publish(pipelineName) {
          _this8.myPipelineApi.save({
            namespace: _this8.$state.params.namespace,
            pipeline: pipelineName
          }, config).$promise.then(removeFromUserDrafts.bind(_this8, pipelineName), function (err) {
            _this8.EventPipe.emit('hideLoadingIcon.immediate');

            _this8.HydratorPlusPlusConsoleActions.addMessage([{
              type: 'error',
              content: angular.isObject(err) ? err.data : err
            }]);
          });
        };

        var config = this.getConfigForExport(); // Checking if Pipeline name already exist

        this.myAppsApi.list({
          namespace: this.$state.params.namespace
        }).$promise.then(function (apps) {
          var appNames = apps.map(function (app) {
            return app.name;
          });

          if (appNames.indexOf(config.name) !== -1) {
            _this8.HydratorPlusPlusConsoleActions.addMessage([{
              type: 'error',
              content: _this8.GLOBALS.en.hydrator.studio.error['NAME-ALREADY-EXISTS']
            }]);

            _this8.EventPipe.emit('hideLoadingIcon.immediate');
          } else {
            publish(config.name);
          }
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

    return HydratorPlusPlusConfigStore;
  }();

  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConfigStore', HydratorPlusPlusConfigStore);
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
  /* /services/create/stores/console-store.js */

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
  var HydratorPlusPlusConsoleStore = /*#__PURE__*/function () {
    HydratorPlusPlusConsoleStore.$inject = ["HydratorPlusPlusConsoleDispatcher"];
    function HydratorPlusPlusConsoleStore(HydratorPlusPlusConsoleDispatcher) {
      _classCallCheck(this, HydratorPlusPlusConsoleStore);

      this.state = {};
      this.setDefaults();
      this.changeListeners = [];
      var dispatcher = HydratorPlusPlusConsoleDispatcher.getDispatcher();
      dispatcher.register('onAddMessage', this.addMessage.bind(this));
      dispatcher.register('onResetMessages', this.resetMessages.bind(this));
    }

    _createClass(HydratorPlusPlusConsoleStore, [{
      key: "setDefaults",
      value: function setDefaults() {
        this.state = {
          messages: []
        };
      }
    }, {
      key: "registerOnChangeListener",
      value: function registerOnChangeListener(callback) {
        var _this = this;

        var index = this.changeListeners.push(callback); // un-subscribe for listners.

        return function () {
          _this.changeListeners.splice(index - 1, 1);
        };
      }
    }, {
      key: "emitChange",
      value: function emitChange() {
        this.changeListeners.forEach(function (callback) {
          return callback();
        });
      }
    }, {
      key: "getMessages",
      value: function getMessages() {
        return this.state.messages;
      }
    }, {
      key: "addMessage",
      value: function addMessage(messages) {
        this.state.messages = messages || [];
        this.emitChange();
      }
    }, {
      key: "resetMessages",
      value: function resetMessages() {
        this.state.messages = [];
        this.emitChange();
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return HydratorPlusPlusConsoleStore;
  }();

  HydratorPlusPlusConsoleStore.$inject = ['HydratorPlusPlusConsoleDispatcher'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).service('HydratorPlusPlusConsoleStore', HydratorPlusPlusConsoleStore);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/create/stores/left-panel-store.js */

  /*
   * Copyright © 2015-2016 Cask Data, Inc.
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
    This store is a collection of extensions and plugins for the side panel.
    {
      plugins: {
        'batchsource': {
          Stream:{
            type: ...,
            artifact: {...},
            allArtifacts: [ {...}, {...}],
            defaultArtifact
          }
        }
      },
      extensions: []
    }
  */
  var leftpanelactions, _DAGPlusPlusFactory, _GLOBALS, _myHelpers, _filter, _hydratorNodeService;

  var popoverTemplate = '/assets/features/hydrator/templates/create/popovers/leftpanel-plugin-popover.html';

  var getInitialState = function getInitialState() {
    return {
      plugins: {
        pluginTypes: {},
        pluginToVersionMap: {}
      },
      extensions: []
    };
  };

  var getTemplatesWithAddedInfo = function getTemplatesWithAddedInfo() {
    var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var extension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    return templates.map(function (template) {
      return Object.assign({}, template, {
        nodeClass: 'plugin-templates',
        name: template.pluginTemplate,
        pluginName: template.pluginName,
        type: extension,
        icon: _DAGPlusPlusFactory.getIcon(template.pluginName),
        template: popoverTemplate,
        allArtifacts: [template.artifact]
      });
    });
  };

  var getPluginsWithAddedInfo = function getPluginsWithAddedInfo() {
    var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var pluginToArtifactArrayMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var extension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if ([plugins.length, extension.length].indexOf(0) !== -1) {
      return plugins;
    }

    var getExtraProperties = function getExtraProperties() {
      var plugin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var extension = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return Object.assign({}, {
        type: extension,
        icon: _DAGPlusPlusFactory.getIcon(plugin.name || plugin.pluginName),
        label: _filter('myRemoveCamelcase')(plugin.name || plugin.pluginName),
        template: popoverTemplate
      });
    };

    var getAllArtifacts = function getAllArtifacts() {
      var _pluginToArtifactArrayMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var plugin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var extension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

      if ([Object.keys(_pluginToArtifactArrayMap).length, Object.keys(plugin).length].indexOf(0) !== -1) {
        return [];
      }

      var _pluginArtifacts = _pluginToArtifactArrayMap[plugin.name || plugin.pluginName];

      if (!Array.isArray(_pluginArtifacts)) {
        return [];
      }

      return _toConsumableArray(_pluginArtifacts).map(function (plug) {
        return Object.assign({}, plug, getExtraProperties(plug, extension));
      });
    };

    var getArtifact = function getArtifact() {
      var _pluginToArtifactArrayMap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var plugin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!Object.keys(plugin).length) {
        return {};
      }

      return _myHelpers.objectQuery(_pluginToArtifactArrayMap, plugin.name || plugin.pluginName, 0, 'artifact') || plugin.artifact;
    };

    return Object.keys(pluginToArtifactArrayMap).map(function (pluginName) {
      var plugin = pluginToArtifactArrayMap[pluginName][0];
      return Object.assign({}, plugin, getExtraProperties(plugin, extension), {
        artifact: getArtifact(pluginToArtifactArrayMap, plugin),
        allArtifacts: getAllArtifacts(pluginToArtifactArrayMap, plugin, extension),
        pluginMapKey: "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name, "-").concat(plugin.artifact.version, "-").concat(plugin.artifact.scope)
      });
    });
  };

  var plugins = function plugins() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getInitialState().plugins;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var stateCopy;

    switch (action.type) {
      case leftpanelactions.PLUGINS_FETCH:
        {
          stateCopy = Object.assign({}, state);
          var _action$payload = action.payload,
              extension = _action$payload.extension,
              _plugins2 = _action$payload.plugins;

          var pluginToArtifactArrayMap = _hydratorNodeService.getPluginToArtifactMap(_plugins2);

          var pluginsWithAddedInfo = getPluginsWithAddedInfo(_plugins2, pluginToArtifactArrayMap, extension);
          stateCopy.pluginTypes[extension] = pluginsWithAddedInfo.map(function (plugin) {
            plugin.defaultArtifact = _hydratorNodeService.getDefaultVersionForPlugin(plugin, state.pluginToVersionMap);
            return plugin;
          }).concat(state.pluginTypes[extension] || []);
          stateCopy.pluginTypes = Object.assign({}, state.pluginTypes, stateCopy.pluginTypes);
          return Object.assign({}, state, stateCopy);
        }

      case leftpanelactions.FETCH_ALL_PLUGINS:
        stateCopy = Object.assign({}, state);
        stateCopy.pluginTypes = Object.assign({}, action.payload.pluginTypes);
        return Object.assign({}, state, stateCopy);

      case leftpanelactions.PLUGIN_TEMPLATE_FETCH:
        {
          stateCopy = Object.assign({}, state);
          var _action$payload2 = action.payload,
              pipelineType = _action$payload2.pipelineType,
              namespace = _action$payload2.namespace,
              res = _action$payload2.res;

          var templatesList = _myHelpers.objectQuery(res, namespace, pipelineType);

          if (!templatesList) {
            return state;
          }

          angular.forEach(templatesList, function (plugins, key) {
            var _templates = _.values(plugins);

            var _pluginWithoutTemplates = (state.pluginTypes[key] || []).filter(function (plug) {
              return !plug.pluginTemplate;
            });

            stateCopy.pluginTypes[key] = getTemplatesWithAddedInfo(_templates, key).concat(_pluginWithoutTemplates);
          });
          return Object.assign({}, state, stateCopy);
        }

      case leftpanelactions.PLUGINS_DEFAULT_VERSION_FETCH:
        {
          var defaultPluginVersionsMap = action.payload.res || {};
          stateCopy = Object.assign({}, getInitialState().plugins);

          if (Object.keys(defaultPluginVersionsMap).length) {
            var pluginTypes = Object.keys(state.pluginTypes); // If this is fetched after the all the plugins have been fetched from the backend then we will update them.

            pluginTypes.forEach(function (pluginType) {
              var _plugins = state.pluginTypes[pluginType];
              stateCopy.pluginTypes[pluginType] = _plugins.map(function (plugin) {
                plugin.defaultArtifact = _hydratorNodeService.getDefaultVersionForPlugin(plugin, defaultPluginVersionsMap);
                return plugin;
              });
            });
            stateCopy.pluginToVersionMap = defaultPluginVersionsMap;
            return Object.assign({}, state, stateCopy);
          }

          return state;
        }

      case leftpanelactions.PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE:
        {
          var _pluginTypes = Object.keys(state.pluginTypes);

          if (!_pluginTypes.length) {
            return state;
          }

          var pluginToVersionMap = angular.copy(state.pluginToVersionMap);

          _pluginTypes.forEach(function (pluginType) {
            state.pluginTypes[pluginType].forEach(function (plugin) {
              if (plugin.pluginTemplate) {
                return;
              }

              var key = "".concat(plugin.name, "-").concat(plugin.type, "-").concat(plugin.artifact.name);
              var isArtifactExistsInBackend = plugin.allArtifacts.filter(function (plug) {
                return angular.equals(plug.artifact, pluginToVersionMap[key]);
              });

              if (!isArtifactExistsInBackend.length) {
                delete pluginToVersionMap[key];
              }
            });
          });

          return Object.assign({}, state, {
            pluginToVersionMap: pluginToVersionMap
          });
        }

      case leftpanelactions.RESET:
        return getInitialState().plugins;

      default:
        return state;
    }
  };

  var extensions = function extensions() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getInitialState().extensions;
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    switch (action.type) {
      case leftpanelactions.EXTENSIONS_FETCH:
        {
          var uiSupportedExtension = function uiSupportedExtension(extension) {
            var pipelineType = action.payload.pipelineType;
            var extensionMap = _GLOBALS.pluginTypes[pipelineType];
            return Object.keys(extensionMap).filter(function (ext) {
              return extensionMap[ext] === extension;
            }).length;
          };

          return [].concat(_toConsumableArray(state), _toConsumableArray(action.payload.extensions.filter(uiSupportedExtension)));
        }

      case leftpanelactions.FETCH_ALL_PLUGINS:
        return [].concat(_toConsumableArray(state), _toConsumableArray(action.payload.extensions));

      case leftpanelactions.RESET:
        return getInitialState().extensions;

      default:
        return state;
    }
  };

  var LeftPanelStore = function LeftPanelStore(LEFTPANELSTORE_ACTIONS, Redux, ReduxThunk, GLOBALS, DAGPlusPlusFactory, myHelpers, $filter, HydratorPlusPlusNodeService) {
    leftpanelactions = LEFTPANELSTORE_ACTIONS;
    _GLOBALS = GLOBALS;
    _myHelpers = myHelpers;
    _DAGPlusPlusFactory = DAGPlusPlusFactory;
    _filter = $filter;
    _hydratorNodeService = HydratorPlusPlusNodeService;
    var combineReducers = Redux.combineReducers,
        applyMiddleware = Redux.applyMiddleware;
    var combineReducer = combineReducers({
      plugins: plugins,
      extensions: extensions
    });
    return Redux.createStore(combineReducer, getInitialState(), window.CaskCommon.CDAPHelpers.composeEnhancers('LeftPanelStore')(applyMiddleware(ReduxThunk["default"])));
  };

  LeftPanelStore.$inject = ['LEFTPANELSTORE_ACTIONS', 'Redux', 'ReduxThunk', 'GLOBALS', 'DAGPlusPlusFactory', 'myHelpers', '$filter', 'HydratorPlusPlusNodeService'];
  angular.module("".concat(PKG.name, ".feature.hydrator")).constant('LEFTPANELSTORE_ACTIONS', {
    'PLUGINS_FETCH': 'PLUGINS_FETCH',
    'FETCH_ALL_PLUGINS': 'FETCH_ALL_PLUGINS',
    'PLUGIN_TEMPLATE_FETCH': 'PLUGIN_TEMPLATE_FETCH',
    'PLUGINS_DEFAULT_VERSION_FETCH': 'PLUGINS_DEFAULT_VERSION_FETCH',
    'EXTENSIONS_FETCH': 'EXTENSIONS_FETCH',
    'RESET': 'LEFTPANELSTORE_RESET',
    'PLUGINS_DEFAULT_VERSION_UPDATE': 'PLUGINS_DEFAULT_VERSION_UPDATE',
    'PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE': 'PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE'
  }).factory('HydratorPlusPlusLeftPanelStore', LeftPanelStore);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /services/create/stores/preview-store.js */

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
  var previewActions;

  var getInitialState = function getInitialState() {
    return {
      isPreviewModeEnabled: false,
      startTime: null,
      status: null,
      previewId: null,
      previewData: false,
      macros: {},
      userRuntimeArguments: {},
      // `runtimeArgsForDisplay` combines `macros` map and `userRuntimeArguments` map
      // to create an object that can be used as a prop to the KeyValuePairs component
      runtimeArgsForDisplay: {},
      timeoutInMinutes: 2
    };
  };

  var preview = function preview() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getInitialState();
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    switch (action.type) {
      case previewActions.TOGGLE_PREVIEW_MODE:
        var isPreviewModeEnabled = action.payload.isPreviewModeEnabled;
        return Object.assign({}, state, {
          isPreviewModeEnabled: isPreviewModeEnabled
        });

      case previewActions.SET_PREVIEW_START_TIME:
        var startTime = action.payload.startTime;
        return Object.assign({}, state, {
          startTime: startTime
        });

      case previewActions.SET_PREVIEW_STATUS:
        var status = action.payload.status;
        return Object.assign({}, state, {
          status: status
        });

      case previewActions.SET_PREVIEW_ID:
        var previewId = action.payload.previewId;
        return Object.assign({}, state, {
          previewId: previewId
        });

      case previewActions.SET_MACROS:
        var macros = action.payload.macrosMap;
        return Object.assign({}, state, {
          macros: macros
        });

      case previewActions.SET_USER_RUNTIME_ARGUMENTS:
        var userRuntimeArguments = action.payload.userRuntimeArgumentsMap;
        return Object.assign({}, state, {
          userRuntimeArguments: userRuntimeArguments
        });

      case previewActions.SET_RUNTIME_ARGS_FOR_DISPLAY:
        var runtimeArgsForDisplay = action.payload.args;
        return Object.assign({}, state, {
          runtimeArgsForDisplay: runtimeArgsForDisplay
        });

      case previewActions.SET_TIMEOUT_IN_MINUTES:
        var timeoutInMinutes = action.payload.timeoutInMinutes;
        return Object.assign({}, state, {
          timeoutInMinutes: timeoutInMinutes
        });

      case previewActions.SET_PREVIEW_DATA:
        return Object.assign({}, state, {
          previewData: true
        });

      case previewActions.RESET_PREVIEW_DATA:
        return Object.assign({}, state, {
          previewData: false
        });

      case previewActions.PREVIEW_RESET:
        return getInitialState();

      default:
        return state;
    }
  };

  var PreviewStore = function PreviewStore(PREVIEWSTORE_ACTIONS, Redux, ReduxThunk) {
    previewActions = PREVIEWSTORE_ACTIONS;
    var combineReducers = Redux.combineReducers,
        applyMiddleware = Redux.applyMiddleware;
    var combineReducer = combineReducers({
      preview: preview
    });
    return Redux.createStore(combineReducer, getInitialState(), Redux.compose(applyMiddleware(ReduxThunk["default"]), window.devToolsExtension ? window.devToolsExtension() : function (f) {
      return f;
    }));
  };
  PreviewStore.$inject = ["PREVIEWSTORE_ACTIONS", "Redux", "ReduxThunk"];

  angular.module("".concat(PKG.name, ".feature.hydrator")).constant('PREVIEWSTORE_ACTIONS', {
    'TOGGLE_PREVIEW_MODE': 'TOGGLE_PREVIEW_MODE',
    'SET_PREVIEW_START_TIME': 'SET_PREVIEW_START_TIME',
    'SET_PREVIEW_STATUS': 'SET_PREVIEW_STATUS',
    'SET_PREVIEW_ID': 'SET_PREVIEW_ID',
    'PREVIEW_RESET': 'PREVIEW_RESET',
    'SET_MACROS': 'SET_MACROS',
    'SET_USER_RUNTIME_ARGUMENTS': 'SET_USER_RUNTIME_ARGUMENTS',
    'SET_RUNTIME_ARGS_FOR_DISPLAY': 'SET_RUNTIME_ARGS_FOR_DISPLAY',
    'SET_TIMEOUT_IN_MINUTES': 'SET_TIMEOUT_IN_MINUTES',
    'SET_PREVIEW_DATA': 'SET_PREVIEW_DATA',
    'RESET_PREVIEW_DATA': 'RESET_PREVIEW_DATA'
  }).factory('HydratorPlusPlusPreviewStore', PreviewStore);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});