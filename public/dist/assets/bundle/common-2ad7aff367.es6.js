function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
  /* /my-dag-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('DAGPlusPlusCtrl', ["jsPlumb", "$scope", "$timeout", "DAGPlusPlusFactory", "GLOBALS", "DAGPlusPlusNodesActionsFactory", "$window", "DAGPlusPlusNodesStore", "$rootScope", "$modifiedPopover", "uuid", "DAGPlusPlusNodesDispatcher", "NonStorePipelineErrorFactory", "AvailablePluginsStore", "myHelpers", "HydratorPlusPlusCanvasFactory", "HydratorPlusPlusConfigStore", "HydratorPlusPlusPreviewActions", "HydratorPlusPlusPreviewStore", function MyDAGController(jsPlumb, $scope, $timeout, DAGPlusPlusFactory, GLOBALS, DAGPlusPlusNodesActionsFactory, $window, DAGPlusPlusNodesStore, $rootScope, $modifiedPopover, uuid, DAGPlusPlusNodesDispatcher, NonStorePipelineErrorFactory, AvailablePluginsStore, myHelpers, HydratorPlusPlusCanvasFactory, HydratorPlusPlusConfigStore, HydratorPlusPlusPreviewActions, HydratorPlusPlusPreviewStore) {
    var _this = this;

    var vm = this;
    var dispatcher = DAGPlusPlusNodesDispatcher.getDispatcher();
    var undoListenerId = dispatcher.register('onUndoActions', resetEndpointsAndConnections);
    var redoListenerId = dispatcher.register('onRedoActions', resetEndpointsAndConnections);
    var localX, localY;
    var SHOW_METRICS_THRESHOLD = 0.8;
    var separation = $scope.separation || 200; // node separation length

    var nodeWidth = 200;
    var nodeHeight = 80;
    var dragged = false;
    vm.isDisabled = $scope.isDisabled;
    vm.disableNodeClick = $scope.disableNodeClick;
    var metricsPopovers = {};
    var selectedConnections = [];
    var conditionNodes = [];
    var normalNodes = [];
    var splitterNodesPorts = {};
    vm.pluginsMap = {};
    vm.adjacencyMap = DAGPlusPlusNodesStore.getAdjacencyMap();
    vm.scale = 1.0;
    vm.panning = {
      style: {
        'top': 0,
        'left': 0
      },
      top: 0,
      left: 0
    };
    vm.nodeMenuOpen = null;
    vm.selectedNode = [];
    vm.activePluginToComment = null;
    vm.doesStagesHaveComments = false;
    var nodesTimeout, fitToScreenTimeout, initTimeout, metricsPopoverTimeout, resetTimeout, highlightSelectedNodeConnectionsTimeout;
    var Mousetrap = window.CaskCommon.Mousetrap;

    vm.checkIfAnyStageHasComment = function () {
      var existingStages = DAGPlusPlusNodesStore.getNodes();
      return !_.isEmpty(existingStages.find(function (node) {
        return Array.isArray(myHelpers.objectQuery(node, 'information', 'comments', 'list')) && node.information.comments.list.length > 0;
      }));
    };

    vm.clearSelectedNodes = function () {
      vm.selectedNode = [];
      vm.instance.clearDragSelection();
      vm.instance.repaintEverything();
    };

    vm.selectNode = function (event, node) {
      if (vm.isDisabled) {
        return;
      }

      var isMultipleNodesDragged = document.querySelectorAll('.jsplumb-drag-selected');
      var isNodeAlreadyInSelection = vm.selectedNode.find(function (selectedNode) {
        return selectedNode.id === node.id;
      });
      event.stopPropagation();
      /**
       * When users selects a bunch of nodes jsplumb adds jsplumb-drag-selected class to the nodes.
       *
       * After selecting the nodes, the user will click on one of the nodes and drag the selection around the canvas.
       * The click on the node shouldn't be considered as node selection. Hence we check if multiple nodes are being
       * dragged and if so just repaint instead of clearing out all selection and selecting that particular node.
       */

      if (isMultipleNodesDragged && isMultipleNodesDragged.length && isNodeAlreadyInSelection) {
        vm.instance.repaintEverything();
        return;
      } // If user clicks on a node with command/ctrl key pressed, keep adding the nodes the selection.


      if (vm.selectionBox.isMultiSelectEnabled) {
        vm.selectedNode.push(node);
        vm.highlightSelectedNodeConnections();
      } else {
        vm.selectedNode = [node];
        clearConnectionsSelection();
        vm.instance.clearDragSelection();
      }

      vm.instance.addToDragSelection(node.name);
      vm.instance.repaintEverything();
    };

    vm.getSelectedNodes = function () {
      return vm.selectedNode;
    };
    /**
     * This is inconsistent when it comes to jsplumb. On connect or detach or click
     * we get the right connection object with proper source and target ids referring
     * to plugin nodes.
     * However when we query vm.instance.getConnnections({sourceId: ...})
     * It returns a connection object that is slightly different. The source
     * now points to the endpoint instead of the actual node. For the love of god
     * I don't know why but will need to file a issue and see what is going on. :sigh:
     */


    vm.getSelectedConnections = function () {
      var connectionsMap = {};
      $scope.connections.forEach(function (conn) {
        connectionsMap["".concat(conn.from, "###").concat(conn.to)] = conn;
      });
      return selectedConnections.map(function (_ref) {
        var source = _ref.source,
            target = _ref.target;
        return {
          from: source.getAttribute('data-nodeid'),
          to: target.getAttribute('data-nodeid')
        };
      }).map(function (_ref2) {
        var from = _ref2.from,
            to = _ref2.to;
        var originalConnection = connectionsMap["".concat(from, "###").concat(to)];

        if (originalConnection) {
          return originalConnection;
        }

        return {
          from: from,
          to: to
        };
      });
    };

    vm.deleteSelectedNodes = function () {
      return vm.onKeyboardDelete();
    };

    vm.onPluginContextMenuOpen = function (nodeId) {
      var isNodeAlreadySelected = vm.selectedNode.find(function (n) {
        return n.id === nodeId;
      });

      if (isNodeAlreadySelected) {
        return;
      }

      var node = DAGPlusPlusNodesStore.getNodes().find(function (n) {
        return n.id === nodeId;
      });

      if (!node) {
        return;
      }

      vm.selectedNode = [node];
      clearConnectionsSelection();
    };

    vm.isNodeSelected = function (nodeName) {
      if (!vm.selectedNode.length) {
        return false;
      }

      return vm.selectedNode.filter(function (node) {
        return node.id === nodeName;
      }).length > 0;
    };
    /**
     * Selection is for multi-select nodes/connections in the pipeline.
     *
     * toggle -
     *   This flag flips the mode between selection mode and move mode. We basically disable
     * dragging for the diagram-container and allow the <selection-box> to take
     * over the user selection
     *
     * isMultiSelectEnabled -
     *   This flag is used when user clicks on command/ctrl and manually selects
     * individual nodes. This is a separate flag as when user selects a node we should
     * be able to differentiate between the normal selection (just clicking on a node)
     * vs command+click in which case the nodes selection behavior is slightly different.
     * The difference should be evident in the vm.selectNodes function
     *
     * isSelectionInProgress -
     *   This flag is used to track if the user is currently selecting a bunch of nodes.
     * We need this flag to be able to easily go between selecting nodes and then clicking
     * on canvas to reset all the selection. This should be more evident in vm.handleCanvasClick
     * function.
     */


    vm.selectionBox = {
      boundaries: ['#diagram-container'],
      selectables: ['.box'],

      /**
       * It makes sense to have the events start -> move -> end to happen
       * in linear order. However under rare circumstances (cypress) this can
       * be out of order, meaning move gets fired before start event callback
       * is fired. The `isSelectionInProgress` is a catch all to make sure no
       * matter what the sequence of callback happens it is right.
       */
      isSelectionInProgress: false,
      toggle: vm.isDisabled ? false : true,
      isMultiSelectEnabled: false,
      start: function start() {
        if (!vm.selectionBox.isSelectionInProgress) {
          vm.clearSelectedNodes();
          clearConnectionsSelection();
          vm.selectionBox.isSelectionInProgress = true;
        }
      },
      move: function move(_ref3) {
        var selected = _ref3.selected;

        if (!vm.selectionBox.isSelectionInProgress) {
          vm.selectionBox.isSelectionInProgress = true;
        }

        var selectedNodes = $scope.nodes.filter(function (node) {
          if (selected.indexOf(node.id) !== -1) {
            return true;
          }

          return false;
        });
        /**
         * This has to be efficient for us to be able to handle large pipelines.
         *
         * Current implementation:
         *
         * I/P : nodes selected
         * 1. Get selected nodes from selection box.
         * 2. Get the adjacency map for the current graph
         * 3. Then iterate through selected nodes and for each node get all nodes connected to it from the adjacency map
         * 4. In the iteration if both the current selected node and the nodes connected to it are
         *    in the list of selected nodes then select the connection. This is where we use the
         *    selectedNodesMap to make a lookup.
         *
         */

        vm.selectedNode = selectedNodes;
        vm.highlightSelectedNodeConnections();
      },
      end: function end() {
        var nodesToAddToDrag = vm.selectedNode.map(function (node) {
          return node.id;
        });
        vm.instance.addToDragSelection(nodesToAddToDrag);
      },
      toggleSelectionMode: function toggleSelectionMode() {
        if (!vm.selectionBox.toggle) {
          vm.secondInstance.setDraggable('diagram-container', false);
          vm.selectionBox.toggle = true;
        } else {
          vm.secondInstance.setDraggable('diagram-container', true);
          vm.selectionBox.toggle = false;
        }
      }
    };
    var repaintTimeoutsMap = {};
    vm.pipelineArtifactType = HydratorPlusPlusConfigStore.getAppType();

    vm.highlightSelectedNodeConnections = function () {
      var selectedNodesMap = {};
      vm.selectedNode.forEach(function (node) {
        return selectedNodesMap[node.id] = true;
      });
      var adjacencyMap = DAGPlusPlusNodesStore.getAdjacencyMap();
      clearConnectionsSelection();
      vm.selectedNode.forEach(function (_ref4) {
        var id = _ref4.id,
            name = _ref4.name;
        var connectedNodes = adjacencyMap[id];

        if (!Array.isArray(connectedNodes)) {
          return;
        }

        var connectionsFromSource = vm.instance.getAllConnections();
        connectedNodes.forEach(function (nodeId) {
          if (!selectedNodesMap[nodeId]) {
            return;
          }

          var connObj = connectionsFromSource.filter(function (conn) {
            return conn.source.getAttribute('data-nodeid') === name && conn.targetId === nodeId;
          });

          if (connObj.length) {
            connObj.forEach(function (conn) {
              toggleConnection(conn, false);
            });
          }
        });
      });
    };

    vm.onPipelineContextMenuPaste = function (_ref5) {
      var nodes = _ref5.nodes,
          connections = _ref5.connections;

      if (!Array.isArray(nodes) || !Array.isArray(connections)) {
        return;
      }

      vm.clearSelectedNodes();
      clearConnectionsSelection();

      var _sanitizeNodesAndConn = sanitizeNodesAndConnectionsBeforePaste({
        nodes: nodes,
        connections: connections
      }),
          newNodes = _sanitizeNodesAndConn.nodes,
          newConnections = _sanitizeNodesAndConn.connections;

      vm.selectedNode = newNodes;
      newNodes = [].concat(_toConsumableArray($scope.nodes), _toConsumableArray(newNodes));
      newConnections = [].concat(_toConsumableArray($scope.connections), _toConsumableArray(newConnections));
      DAGPlusPlusNodesActionsFactory.createGraphFromConfigOnPaste(newNodes, newConnections);
      vm.instance.unbind('connection');
      vm.instance.unbind('connectionDetached');
      vm.instance.unbind('connectionMoved');
      vm.instance.unbind('beforeDrop');
      vm.instance.unbind('click');
      vm.instance.detachEveryConnection();
      init();
      $timeout.cancel(highlightSelectedNodeConnectionsTimeout);
      highlightSelectedNodeConnectionsTimeout = $timeout(function () {
        return vm.highlightSelectedNodeConnections();
      });
      vm.instance.clearDragSelection();

      try {
        $scope.$digest();
      } catch (e) {
        return;
      }
    };

    vm.getPluginConfiguration = function () {
      if (!vm.selectedNode.length) {
        return;
      }

      return {
        stages: _this.selectedNode.map(function (node) {
          return {
            id: node.id,
            name: node.name,
            icon: node.icon,
            type: node.type,
            outputSchema: node.outputSchema,
            plugin: {
              name: node.plugin.name,
              artifact: node.plugin.artifact,
              properties: angular.copy(node.plugin.properties),
              label: node.plugin.label
            },
            comments: node.comments
          };
        })
      };
    };

    function repaintEverything() {
      var id = uuid.v4();
      repaintTimeoutsMap[id] = $timeout(function () {
        vm.instance.repaintEverything();
      }).then(function () {
        $timeout.cancel(repaintTimeoutsMap[id]);
        delete repaintTimeoutsMap[id];
      });
    }

    function init() {
      $scope.nodes = DAGPlusPlusNodesStore.getNodes();
      $scope.connections = DAGPlusPlusNodesStore.getConnections();
      vm.undoStates = DAGPlusPlusNodesStore.getUndoStates();
      vm.redoStates = DAGPlusPlusNodesStore.getRedoStates();
      initTimeout = $timeout(function () {
        initNodes();
        addConnections();
        bindJsPlumbEvents();
        bindKeyboardEvents();

        if (vm.isDisabled) {
          disableAllEndpoints();
        } // Process metrics data


        if ($scope.showMetrics) {
          angular.forEach($scope.nodes, function (node) {
            var elem = angular.element(document.getElementById(node.id || node.name)).children();
            var scope = $rootScope.$new();
            scope.data = {
              node: node
            };
            scope.version = node.plugin.artifact.version;
            metricsPopovers[node.name] = {
              scope: scope,
              element: elem,
              popover: null,
              isShowing: false
            };
            $scope.$on('$destroy', function () {
              elem.remove();
              elem = null;
              scope.$destroy();
            });
          });
          $scope.$watch('metricsData', function () {
            if (Object.keys($scope.metricsData).length === 0) {
              angular.forEach(metricsPopovers, function (value) {
                value.scope.data.metrics = 0;
              });
            }

            angular.forEach($scope.metricsData, function (pluginMetrics, pluginName) {
              var metricsToDisplay = {};
              var pluginMetricsKeys = Object.keys(pluginMetrics);

              var _loop = function _loop(i) {
                var pluginMetric = pluginMetricsKeys[i];

                if (_typeof(pluginMetrics[pluginMetric]) === 'object') {
                  metricsToDisplay[pluginMetric] = _.sum(Object.keys(pluginMetrics[pluginMetric]).map(function (key) {
                    return pluginMetrics[pluginMetric][key];
                  }));
                } else {
                  metricsToDisplay[pluginMetric] = pluginMetrics[pluginMetric];
                }
              };

              for (var i = 0; i < pluginMetricsKeys.length; i++) {
                _loop(i);
              }

              metricsPopovers[pluginName].scope.data.metrics = metricsToDisplay;
            });
          }, true);
        }

        vm.doesStagesHaveComments = vm.checkIfAnyStageHasComment();
      }); // This is here because the left panel is initially in the minimized mode and expands
      // based on user setting on local storage. This is taking more than a single angular digest cycle
      // Hence the timeout to 1sec to render it in subsequent digest cycles.
      // FIXME: This directive should not be dependent on specific external component to render itself.
      // The left panel should default to expanded view and cleaning up the graph and fit to screen should happen in parallel.

      fitToScreenTimeout = $timeout(function () {
        vm.cleanUpGraph();
        vm.fitToScreen();
      }, 500);
    }

    function bindJsPlumbEvents() {
      vm.instance.bind('connection', addConnection);
      vm.instance.bind('connectionDetached', removeConnection);
      vm.instance.bind('connectionMoved', moveConnection);
      vm.instance.bind('beforeDrop', checkIfConnectionExistsOrValid); // jsPlumb docs say the event for clicking on an endpoint is called 'endpointClick',
      // but seems like the 'click' event is triggered both when clicking on an endpoint &&
      // clicking on a connection

      vm.instance.bind('click', toggleConnections);
    }

    function bindKeyboardEvents() {
      Mousetrap.bind(['command+z', 'ctrl+z'], vm.undoActions);
      Mousetrap.bind(['command+shift+z', 'ctrl+shift+z'], vm.redoActions);
      Mousetrap.bind(['del', 'backspace'], vm.onKeyboardDelete);
      Mousetrap.bind(['command+c', 'ctrl+c'], vm.onKeyboardCopy);

      if (vm.isDisabled) {
        return;
      } // Toggle between move mode. With spacebar users can move the entire canvas


      Mousetrap.bind('space', function () {
        $scope.$apply(function () {
          vm.secondInstance.setDraggable('diagram-container', false);
          vm.selectionBox.toggle = true;
        });
      }, 'keyup');
      Mousetrap.bind('space', function () {
        $scope.$apply(function () {
          vm.secondInstance.setDraggable('diagram-container', true);
          vm.selectionBox.toggle = false;
        });
      }, 'keydown'); // Select all the nodes in the canvas.

      Mousetrap.bind('command+a', function () {
        var nodes = $scope.nodes;
        vm.selectedNode = nodes;
        vm.highlightSelectedNodeConnections();
        vm.instance.addToDragSelection(nodes.map(function (node) {
          return node.name;
        }));
        return false;
      }); // Select multiple nodes by manually selecting nodes.

      Mousetrap.bind('shift', function () {
        vm.selectionBox.isMultiSelectEnabled = true;
      }, 'keydown');
      Mousetrap.bind('shift', function () {
        vm.selectionBox.isMultiSelectEnabled = false;
      }, 'keyup');
    }

    function unbindKeyboardEvents() {
      Mousetrap.unbind(['command+z', 'ctrl+z']);
      Mousetrap.unbind(['command+shift+z', 'ctrl+shift+z']);
      Mousetrap.unbind(['command+c', 'ctrl+c']);
      Mousetrap.unbind(['del', 'backspace']);
      Mousetrap.unbind('shift');
      Mousetrap.unbind('space');
      Mousetrap.unbind('command+a');
    }

    function closeMetricsPopover(node) {
      var nodeInfo = metricsPopovers[node.name];

      if (metricsPopoverTimeout) {
        $timeout.cancel(metricsPopoverTimeout);
      }

      if (nodeInfo && nodeInfo.popover) {
        nodeInfo.popover.hide();
        nodeInfo.popover.destroy();
        nodeInfo.popover = null;
      }
    }

    vm.onKeyboardDelete = function onKeyboardDelete() {
      if (vm.selectedNode.length) {
        vm.onNodeDelete(null, vm.selectedNode);
      } else {
        vm.removeSelectedConnections();
      }
    };

    vm.nodeMouseEnter = function (node) {
      if (!$scope.showMetrics || vm.scale >= SHOW_METRICS_THRESHOLD) {
        return;
      }

      var nodeInfo = metricsPopovers[node.name];

      if (metricsPopoverTimeout) {
        $timeout.cancel(metricsPopoverTimeout);
      }

      if (nodeInfo.element && nodeInfo.scope) {
        nodeInfo.popover = $modifiedPopover(nodeInfo.element, {
          trigger: 'manual',
          placement: 'auto right',
          target: angular.element(nodeInfo.element[0]),
          templateUrl: $scope.metricsPopoverTemplate,
          container: 'main',
          scope: nodeInfo.scope
        });
        nodeInfo.popover.$promise.then(function () {
          // Needs a timeout here to avoid showing popups instantly when just moving
          // cursor across a node
          metricsPopoverTimeout = $timeout(function () {
            if (nodeInfo.popover && typeof nodeInfo.popover.show === 'function') {
              nodeInfo.popover.show();
            }
          }, 500);
        });
      }
    };

    vm.nodeMouseLeave = function (node) {
      if (!$scope.showMetrics || vm.scale >= SHOW_METRICS_THRESHOLD) {
        return;
      }

      closeMetricsPopover(node);
    };

    vm.zoomIn = function () {
      vm.scale += 0.1;
      setZoom(vm.scale, vm.instance);
    };

    vm.zoomOut = function () {
      if (vm.scale <= 0.2) {
        return;
      }

      vm.scale -= 0.1;
      setZoom(vm.scale, vm.instance);
    };
    /**
     * Utily function from jsPlumb
     * https://jsplumbtoolkit.com/community/doc/zooming.html
     *
     * slightly modified to fit our needs
     **/


    function setZoom(zoom, instance, transformOrigin, el) {
      if ($scope.nodes.length === 0) {
        return;
      }

      transformOrigin = transformOrigin || [0.5, 0.5];
      instance = instance || jsPlumb;
      el = el || instance.getContainer();
      var p = ['webkit', 'moz', 'ms', 'o'],
          s = 'scale(' + zoom + ')',
          oString = transformOrigin[0] * 100 + '% ' + transformOrigin[1] * 100 + '%';

      for (var i = 0; i < p.length; i++) {
        el.style[p[i] + 'Transform'] = s;
        el.style[p[i] + 'TransformOrigin'] = oString;
      }

      el.style['transform'] = s;
      el.style['transformOrigin'] = oString;
      instance.setZoom(zoom);
      repaintEverything();
    }

    function initNodes() {
      angular.forEach($scope.nodes, function (node) {
        var key = generatePluginMapKey(node);
        var ispluginsMapAvailable = Object.keys(vm.pluginsMap).length; // If pluginsMap is not available yet, consider the plugin to be valid until we know otherwise

        node.isPluginAvailable = ispluginsMapAvailable ? Boolean(myHelpers.objectQuery(vm.pluginsMap, key, 'pluginInfo')) : true;

        if (node.type === 'condition') {
          initConditionNode(node.id);
        } else if (node.type === 'splittertransform') {
          initSplitterNode(node);
        } else {
          initNormalNode(node);
        }

        if (!vm.instance.isTarget(node.name)) {
          var targetOptions = Object.assign({}, vm.targetNodeOptions);

          if (node.type === 'alertpublisher') {
            targetOptions.scope = 'alertScope';
          } else if (node.type === 'errortransform') {
            targetOptions.scope = 'errorScope';
          } // Disabling the ability to disconnect a connection from target


          if (vm.isDisabled) {
            targetOptions.connectionsDetachable = false;
          }

          vm.instance.makeTarget(node.id, targetOptions);
        }
      });
    }

    function initNormalNode(node) {
      if (normalNodes.indexOf(node.name) !== -1) {
        return;
      }

      addEndpointForNormalNode('endpoint_' + node.id);

      if (!_.isEmpty(vm.pluginsMap) && !vm.isDisabled) {
        addErrorAlertEndpoints(node);
      }

      normalNodes.push(node.name);
    }

    function initConditionNode(nodeName) {
      if (conditionNodes.indexOf(nodeName) !== -1) {
        return;
      }

      addEndpointForConditionNode('endpoint_' + nodeName + '_condition_true', vm.conditionTrueEndpointStyle, 'yesLabel');
      addEndpointForConditionNode('endpoint_' + nodeName + '_condition_false', vm.conditionFalseEndpointStyle, 'noLabel');
      conditionNodes.push(nodeName);
    }

    function initSplitterNode(node) {
      if (!node.outputSchema || !Array.isArray(node.outputSchema) || Array.isArray(node.outputSchema) && node.outputSchema[0].name === GLOBALS.defaultSchemaName) {
        var _splitterPorts = splitterNodesPorts[node.name];

        if (!_.isEmpty(_splitterPorts)) {
          angular.forEach(_splitterPorts, function (port) {
            var portElId = 'endpoint_' + node.id + '_port_' + port;
            deleteEndpoints(portElId);
          });
          DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
          delete splitterNodesPorts[node.name];
        }

        return;
      }

      var newPorts = node.outputSchema.map(function (schema) {
        return schema.name;
      });
      var splitterPorts = splitterNodesPorts[node.name];
      var portsChanged = !_.isEqual(splitterPorts, newPorts);

      if (!portsChanged) {
        return;
      }

      angular.forEach(splitterPorts, function (port) {
        var portElId = 'endpoint_' + node.id + '_port_' + port;
        deleteEndpoints(portElId);
      });
      angular.forEach(node.outputSchema, function (outputSchema) {
        addEndpointForSplitterNode('endpoint_' + node.id + '_port_' + outputSchema.name);
      });
      DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
      splitterNodesPorts[node.name] = newPorts;
    }

    function addEndpointForNormalNode(endpointDOMId, customConfig) {
      var endpointDOMEl = document.getElementById(endpointDOMId);
      var endpointObj = Object.assign({}, {
        isSource: true,
        cssClass: "plugin-".concat(endpointDOMId, "-right")
      }, customConfig);

      if (vm.isDisabled) {
        endpointObj.enabled = false;
      }

      var endpoint = vm.instance.addEndpoint(endpointDOMEl, endpointObj);
      addListenersForEndpoint(endpoint, endpointDOMEl);
    }

    function addEndpointForConditionNode(endpointDOMId, endpointStyle, overlayLabel) {
      var endpointDOMEl = document.getElementById(endpointDOMId);
      endpointStyle.cssClass += " plugin-".concat(endpointDOMId);
      var newEndpoint = vm.instance.addEndpoint(endpointDOMEl, endpointStyle);
      newEndpoint.hideOverlay(overlayLabel);
      addListenersForEndpoint(newEndpoint, endpointDOMEl, overlayLabel);
    }

    function addEndpointForSplitterNode(endpointDOMId) {
      var endpointDOMEl = document.getElementById(endpointDOMId);
      var splitterEndpointStyleWithUUID = Object.assign({}, vm.splitterEndpointStyle, {
        uuid: endpointDOMId
      });
      splitterEndpointStyleWithUUID.cssClass = "plugin-".concat(endpointDOMId);
      var splitterEndpoint = vm.instance.addEndpoint(endpointDOMEl, splitterEndpointStyleWithUUID);
      addListenersForEndpoint(splitterEndpoint, endpointDOMEl);
    }

    function addConnections() {
      angular.forEach($scope.connections, function (conn) {
        var sourceNode = $scope.nodes.find(function (node) {
          return node.name === conn.from;
        });
        var targetNode = $scope.nodes.find(function (node) {
          return node.name === conn.to;
        });

        if (!sourceNode || !targetNode) {
          return;
        }

        var connObj = {
          target: targetNode.id
        };

        if (conn.hasOwnProperty('condition')) {
          connObj.source = vm.instance.getEndpoints("endpoint_".concat(sourceNode.id, "_condition_").concat(conn.condition))[0];
        } else if (conn.hasOwnProperty('port')) {
          connObj.source = vm.instance.getEndpoint("endpoint_".concat(sourceNode.id, "_port_").concat(conn.port));
        } else if (targetNode.type === 'errortransform' || targetNode.type === 'alertpublisher') {
          if (!_.isEmpty(vm.pluginsMap) && !vm.isDisabled) {
            addConnectionToErrorsAlerts(conn, sourceNode, targetNode);
            return;
          }
        } else {
          connObj.source = vm.instance.getEndpoints("endpoint_".concat(sourceNode.id))[0];
        }

        if (connObj.source && connObj.target) {
          connObj.cssClass = "connection-id-".concat(sourceNode.name, "-").concat(targetNode.name);
          var newConn = vm.instance.connect(connObj);

          if (targetNode.type === 'condition' || sourceNode.type === 'action' || targetNode.type === 'action' || sourceNode.type === 'sparkprogram' || targetNode.type === 'sparkprogram') {
            newConn.setType('dashed');
          }
        }
      });
    }

    function addErrorAlertEndpoints(node) {
      if (vm.shouldShowAlertsPort(node)) {
        addEndpointForNormalNode('endpoint_' + node.id + '_alert', vm.alertEndpointStyle);
      }

      if (vm.shouldShowErrorsPort(node)) {
        addEndpointForNormalNode('endpoint_' + node.id + '_error', vm.errorEndpointStyle);
      }
    }

    var addConnectionToErrorsAlerts = function addConnectionToErrorsAlerts(conn, sourceNode, targetNode) {
      var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
      var connObj = {
        target: sanitize(conn.to)
      };
      var errorSourceId = "endpoint_".concat(sourceNode.id, "_error");
      var alertSourceId = "endpoint_".concat(sourceNode.id, "_alert");
      var connectionExist = false;

      if (targetNode.type === 'errortransform') {
        connectionExist = vm.instance.getConnections('errorScope').map(function (connection) {
          return "".concat(connection.sourceId, "-##-").concat(connection.targetId);
        }).find(function (connStr) {
          return connStr === "".concat(errorSourceId, "-##-").concat(sanitize(conn.to));
        });
      } else if (targetNode.type === 'alertpublisher') {
        connectionExist = vm.instance.getConnections('alertScope').map(function (connection) {
          return "".concat(connection.sourceId, "-##-").concat(connection.targetId);
        }).find(function (connStr) {
          return connStr === "".concat(alertSourceId, "-##-").concat(sanitize(conn.to));
        });
      }

      if (connectionExist) {
        return;
      }

      if (targetNode.type === 'errortransform' && vm.shouldShowErrorsPort(sourceNode)) {
        connObj.source = vm.instance.getEndpoints(errorSourceId)[0];
      } else if (targetNode.type === 'alertpublisher' && vm.shouldShowAlertsPort(sourceNode)) {
        connObj.source = vm.instance.getEndpoints(alertSourceId)[0];
      } else {
        connObj.source = vm.instance.getEndpoints("endpoint_".concat(sourceNode.id))[0]; // this is for backwards compability with old pipelines where we don't specify
        // emit-alerts and emit-error in the plugin config yet. In those cases we should
        // still connect to the Error Collector/Alert Publisher using the normal endpoint

        var scopeString = vm.instance.getDefaultScope() + ' alertScope errorScope';
        connObj.source.scope = scopeString;
      }

      var defaultConnectorSettings = vm.defaultDagSettings.Connector;
      connObj.connector = [defaultConnectorSettings[0], Object.assign({}, defaultConnectorSettings[1], {
        midpoint: 0
      })];
      connObj.cssClass = "connection-id-".concat(sourceNode.name, "-").concat(targetNode.name);
      vm.instance.connect(connObj);
    };

    function addErrorAlertsEndpointsAndConnections() {
      // Need the timeout because it takes an Angular tick for the Alert and Error port DOM elements
      // to show up after vm.pluginsMap is populated
      var addErrorAlertEndpointsTimeout = $timeout(function () {
        angular.forEach($scope.nodes, function (node) {
          addErrorAlertEndpoints(node);
        });
        vm.instance.unbind('connection');
        angular.forEach($scope.connections, function (conn) {
          var sourceNode = $scope.nodes.find(function (node) {
            return node.name === conn.from;
          });
          var targetNode = $scope.nodes.find(function (node) {
            return node.name === conn.to;
          });

          if (!sourceNode || !targetNode) {
            return;
          }

          if (targetNode.type === 'errortransform' || targetNode.type === 'alertpublisher') {
            addConnectionToErrorsAlerts(conn, sourceNode, targetNode);
          }
        });
        vm.instance.bind('connection', addConnection);
        repaintEverything();
        $timeout.cancel(addErrorAlertEndpointsTimeout);
      });
    }

    function transformCanvas(top, left) {
      var newTop = top + vm.panning.top;
      var newLeft = left + vm.panning.left;
      vm.setCanvasPanning(newTop, newLeft);
    }

    vm.setCanvasPanning = function (top, left) {
      vm.panning.top = top;
      vm.panning.left = left;
      vm.panning.style = {
        'top': vm.panning.top + 'px',
        'left': vm.panning.left + 'px'
      };
    };

    vm.handleCanvasClick = function (e) {
      if (vm.selectionBox.isSelectionInProgress) {
        vm.selectionBox.isSelectionInProgress = false;
        return;
      }

      if (e) {
        var target = e.target;
        var isTargetDAGContainer = target.getAttribute('id') === 'dag-container';

        if (!isTargetDAGContainer) {
          return;
        }
      }

      if (vm.activePluginToComment) {
        vm.activePluginToComment = null;
      }

      vm.instance.clearDragSelection();
      vm.toggleNodeMenu();
      clearConnectionsSelection();
      vm.clearSelectedNodes();
    };

    function addConnection(newConnObj) {
      // source is always a specific endpoint on the right of the node
      // target is always a contionous endpoint on the left of the node.
      var sourceNodeId = newConnObj.source.getAttribute('data-nodeid');
      var targetNodeId = newConnObj.target.getAttribute('data-nodeid');
      var sourceDOMID = newConnObj.source.getAttribute('id');
      var targetDOMID = newConnObj.target.getAttribute('id');
      /**
       * We set the connection to be between nodes which refers to the node name.
       * we need the DOM ID for jsplumb and selecting nodes and connections
       * We are not using name today because node names can have anything including
       * space or any special character which is not allowed in for DOM 'id' attribute.
       */

      var connection = {
        from: sourceNodeId,
        to: targetNodeId
      };
      var source = newConnObj.source.getAttribute('data-nodetype');
      newConnObj.connection.connector.canvas.classList.add("connection-id-".concat(sourceDOMID, "-").concat(targetDOMID));
      /**
       * If the connection is from a condition or a splitter transform
       * we need information on the source of this connection. For condition
       * it could yes/no ports or for the splitter transform it needs to be
       * the port name (null/non-null or custom ports)
       */

      if (source === 'splitter') {
        connection.port = newConnObj.source.getAttribute('data-portname');
      } else if (source.indexOf('condition') !== -1) {
        connection.condition = source === 'condition-true' ? 'true' : 'false';
      }

      $scope.connections.push(connection);
      DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
    }

    function removeConnection(detachedConnObj) {
      var updateStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var connObj = Object.assign({}, detachedConnObj);

      if (!detachedConnObj.source || _typeof(detachedConnObj.source) !== 'object') {
        return;
      }

      var sourceNodeId = detachedConnObj.source.getAttribute('data-nodeid');
      var targetNodeId = detachedConnObj.target.getAttribute('data-nodeid');
      connObj.sourceId = sourceNodeId;
      connObj.targetId = targetNodeId;

      var connectionIndex = _.findIndex($scope.connections, function (conn) {
        return conn.from === connObj.sourceId && conn.to === connObj.targetId;
      });

      if (connectionIndex !== -1) {
        $scope.connections.splice(connectionIndex, 1);
      }

      if (updateStore) {
        DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
      }
    }

    function moveConnection(moveInfo) {
      var oldConnection = {
        sourceId: moveInfo.originalSourceId,
        targetId: moveInfo.originalTargetId
      };

      if (myHelpers.objectQuery(moveInfo, 'originalSourceEndpoint', 'element')) {
        oldConnection.source = moveInfo.originalSourceEndpoint.element;
      }

      if (myHelpers.objectQuery(moveInfo, 'originalTargetEndpoint', 'element')) {
        oldConnection.target = moveInfo.originalTargetEndpoint.element;
      } // don't need to call addConnection for the new connection, since that will be done
      // automatically as part of the 'connection' event


      removeConnection(oldConnection, false);
    }

    vm.removeSelectedConnections = function () {
      if (selectedConnections.length === 0 || vm.isDisabled) {
        return;
      }

      vm.instance.unbind('connectionDetached');
      angular.forEach(selectedConnections, function (selectedConnectionObj) {
        removeConnection(selectedConnectionObj, false);
        vm.instance.detach(selectedConnectionObj);
      });
      vm.instance.bind('connectionDetached', removeConnection);
      selectedConnections = [];
      DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
    };

    function toggleConnections(selectedObj, event) {
      if (vm.isDisabled) {
        return;
      }

      vm.clearSelectedNodes();

      if (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
      } // is connection


      if (selectedObj.sourceId && selectedObj.targetId) {
        toggleConnection(selectedObj);
        return;
      }

      if (!selectedObj.connections || !selectedObj.connections.length) {
        return;
      } // else is endpoint


      if (selectedObj.isTarget) {
        toggleConnection(selectedObj.connections[0]);
        return;
      }

      var connectionsToToggle = selectedObj.connections;

      var notYetSelectedConnections = _.difference(connectionsToToggle, selectedConnections); // This is to toggle all connections coming from an endpoint.
      // If zero, one or more (but not all) of the connections are already selected,
      // then just select the remaining ones. Else if they're all selected,
      // then unselect them.


      if (notYetSelectedConnections.length !== 0) {
        notYetSelectedConnections.forEach(function (connection) {
          selectedConnections.push(connection);
          connection.addClass('selected-connector');
          connection.addType('selected');
        });
      } else {
        connectionsToToggle.forEach(function (connection) {
          selectedConnections.splice(selectedConnections.indexOf(connection), 1);
          connection.removeClass('selected-connector');
          connection.removeType('selected');
        });
      }
    }

    function toggleConnection(connObj) {
      var toggle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (!connObj) {
        return;
      }

      if (selectedConnections.indexOf(connObj) === -1) {
        selectedConnections.push(connObj);
      } else {
        selectedConnections.splice(selectedConnections.indexOf(connObj), 1);
      }

      if (!toggle) {
        connObj.addClass('selected-connector');
        connObj.addType('selected');
        return;
      }

      connObj.toggleType('selected');
      connObj.removeClass('selected-connector');
    }

    function clearConnectionsSelection() {
      selectedConnections.forEach(function (conn) {
        var existingTypes = conn.getType();

        if (Array.isArray(existingTypes) && existingTypes.indexOf('selected') !== -1) {
          conn.toggleType('selected');
          conn.removeClass('selected-connector');
        }
      });
      selectedConnections = [];
    }

    function deleteEndpoints(elementId) {
      vm.instance.unbind('connectionDetached');
      var endpoint = vm.instance.getEndpoints(elementId);

      if (endpoint) {
        angular.forEach(endpoint, function (ep) {
          angular.forEach(ep.connections, function (conn) {
            removeConnection(conn, false);
            vm.instance.detach(conn);
          });
          vm.instance.deleteEndpoint(ep);
        });
      }

      vm.instance.bind('connectionDetached', removeConnection);
    }

    function disableEndpoint(uuid) {
      var endpoint = vm.instance.getEndpoint(uuid);

      if (endpoint) {
        endpoint.setEnabled(false);
      }
    }

    function disableEndpoints(elementId) {
      var endpointArr = vm.instance.getEndpoints(elementId);

      if (endpointArr) {
        angular.forEach(endpointArr, function (endpoint) {
          endpoint.setEnabled(false);
        });
      }
    }

    function disableAllEndpoints() {
      angular.forEach($scope.nodes, function (node) {
        if (node.plugin.type === 'condition') {
          var endpoints = ["endpoint_".concat(node.id, "_condition_true"), "endpoint_".concat(node.id, "_condition_false")];
          angular.forEach(endpoints, function (endpoint) {
            disableEndpoints(endpoint);
          });
        } else if (node.plugin.type === 'splittertransform') {
          var portNames = node.outputSchema.map(function (port) {
            return port.name;
          });

          var _endpoints = portNames.map(function (portName) {
            return "endpoint_".concat(node.id, "_port_").concat(portName);
          });

          angular.forEach(_endpoints, function (endpoint) {
            // different from others because the name here is the uuid of the splitter endpoint,
            // not the id of DOM element
            disableEndpoint(endpoint);
          });
        } else {
          disableEndpoints('endpoint_' + node.id);

          if (vm.shouldShowAlertsPort(node)) {
            disableEndpoints('endpoint_' + node.id + '_alert');
          }

          if (vm.shouldShowErrorsPort(node)) {
            disableEndpoints('endpoint_' + node.id + '_error');
          }
        }
      });
    }

    function addHoverListener(endpoint, domCircleEl, labelId) {
      if (!domCircleEl.classList.contains('hover')) {
        domCircleEl.classList.add('hover');
      }

      if (labelId) {
        endpoint.showOverlay(labelId);
      }
    }

    function removeHoverListener(endpoint, domCircleEl, labelId) {
      if (domCircleEl.classList.contains('hover')) {
        domCircleEl.classList.remove('hover');
      }

      if (labelId) {
        endpoint.hideOverlay(labelId);
      }
    }

    function addListenersForEndpoint(endpoint, domCircleEl, labelId) {
      endpoint.canvas.removeEventListener('mouseover', addHoverListener);
      endpoint.canvas.removeEventListener('mouseout', removeHoverListener);
      endpoint.canvas.addEventListener('mouseover', addHoverListener.bind(null, endpoint, domCircleEl, labelId));
      endpoint.canvas.addEventListener('mouseout', removeHoverListener.bind(null, endpoint, domCircleEl, labelId));
    }

    function checkIfConnectionExistsOrValid(connObj) {
      // return false if connection already exists, which will prevent the connecton from being formed
      connObj.sourceId = connObj.connection.source.getAttribute('data-nodeid');

      var exists = _.find($scope.connections, function (conn) {
        return conn.from === connObj.sourceId && conn.to === connObj.targetId;
      });

      var sameNode = connObj.sourceId === connObj.targetId;

      if (exists || sameNode) {
        return false;
      } // else check if the connection is valid


      var sourceNode = $scope.nodes.find(function (node) {
        return node.name === connObj.sourceId;
      });
      var targetNode = $scope.nodes.find(function (node) {
        return node.id === connObj.targetId;
      });
      var valid = true;
      NonStorePipelineErrorFactory.connectionIsValid(sourceNode, targetNode, function (invalidConnection) {
        if (invalidConnection) {
          valid = false;
        }
      });

      if (!valid) {
        return valid;
      } // If valid, then modifies the look of the connection before showing it


      if (sourceNode.type === 'action' || targetNode.type === 'action' || sourceNode.type === 'sparkprogram' || targetNode.type === 'sparkprogram') {
        connObj.connection.setType('dashed');
      } else if (sourceNode.type !== 'condition' && targetNode.type !== 'condition') {
        connObj.connection.setType('basic solid');
      } else {
        if (sourceNode.type === 'condition') {
          if (connObj.connection.endpoints && connObj.connection.endpoints.length > 0) {
            var sourceEndpoint = connObj.dropEndpoint;
            var nodeType = sourceEndpoint.canvas.getAttribute('data-nodetype');

            if (nodeType === 'condition-true') {
              connObj.connection.setType('conditionTrue');
            }

            if (nodeType === 'condition-false') {
              connObj.connection.setType('conditionFalse');
            }
          }
        } else {
          connObj.connection.setType('basic');
        }

        if (targetNode.type === 'condition') {
          connObj.connection.addType('dashed');
        }
      }

      repaintEverything();
      return valid;
    }

    function resetEndpointsAndConnections() {
      if (resetTimeout) {
        $timeout.cancel(resetTimeout);
      }

      resetTimeout = $timeout(function () {
        vm.instance.reset();
        normalNodes = [];
        conditionNodes = [];
        splitterNodesPorts = {};
        $scope.nodes = DAGPlusPlusNodesStore.getNodes();
        $scope.connections = DAGPlusPlusNodesStore.getConnections();
        vm.undoStates = DAGPlusPlusNodesStore.getUndoStates();
        vm.redoStates = DAGPlusPlusNodesStore.getRedoStates();
        makeNodesDraggable();
        initNodes();
        addConnections();
        selectedConnections = [];
        bindJsPlumbEvents();
      });
    }

    function makeNodesDraggable() {
      if (vm.isDisabled) {
        return;
      }

      var nodes = document.querySelectorAll('.box');
      vm.instance.draggable(nodes, {
        start: function start(drag) {
          var currentCoordinates = {
            x: drag.e.clientX,
            y: drag.e.clientY
          };

          if (currentCoordinates.x === localX && currentCoordinates.y === localY) {
            return;
          }

          localX = currentCoordinates.x;
          localY = currentCoordinates.y;
          dragged = true;
          var nodeId = drag.el.getAttribute('id');
          var isNodeAlreadySelected = vm.selectedNode.find(function (selectedNode) {
            return selectedNode.id === nodeId;
          });

          if (!isNodeAlreadySelected) {
            vm.instance.clearDragSelection();
          }

          vm.resetActivePluginForComment();
        },
        stop: function stop(dragEndEvent) {
          var config = {
            _uiPosition: {
              top: dragEndEvent.el.style.top,
              left: dragEndEvent.el.style.left
            }
          };
          DAGPlusPlusNodesActionsFactory.updateNode(dragEndEvent.el.id, config);
        }
      });
    }

    vm.selectEndpoint = function (event, node) {
      if (event.target.className.indexOf('endpoint-circle') === -1) {
        return;
      }

      vm.clearSelectedNodes();
      var sourceElem = node.id;
      var endpoints = vm.instance.getEndpoints(sourceElem);

      if (!endpoints) {
        return;
      }

      for (var i = 0; i < endpoints.length; i++) {
        var endpoint = endpoints[i];

        if (endpoint.connections && endpoint.connections.length > 0) {
          if (endpoint.connections[0].sourceId === node.id || endpoint.connections[0].sourceId === node.name) {
            toggleConnections(endpoint);
            break;
          }
        }
      }

      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    jsPlumb.ready(function () {
      var dagSettings = DAGPlusPlusFactory.getSettings();
      var defaultDagSettings = dagSettings.defaultDagSettings,
          defaultConnectionStyle = dagSettings.defaultConnectionStyle,
          selectedConnectionStyle = dagSettings.selectedConnectionStyle,
          dashedConnectionStyle = dagSettings.dashedConnectionStyle,
          solidConnectionStyle = dagSettings.solidConnectionStyle,
          conditionTrueConnectionStyle = dagSettings.conditionTrueConnectionStyle,
          conditionTrueEndpointStyle = dagSettings.conditionTrueEndpointStyle,
          conditionFalseConnectionStyle = dagSettings.conditionFalseConnectionStyle,
          conditionFalseEndpointStyle = dagSettings.conditionFalseEndpointStyle,
          splitterEndpointStyle = dagSettings.splitterEndpointStyle,
          alertEndpointStyle = dagSettings.alertEndpointStyle,
          errorEndpointStyle = dagSettings.errorEndpointStyle,
          targetNodeOptions = dagSettings.targetNodeOptions;
      vm.defaultDagSettings = defaultDagSettings;
      vm.conditionTrueEndpointStyle = conditionTrueEndpointStyle;
      vm.conditionFalseEndpointStyle = conditionFalseEndpointStyle;
      vm.splitterEndpointStyle = splitterEndpointStyle;
      vm.alertEndpointStyle = alertEndpointStyle;
      vm.errorEndpointStyle = errorEndpointStyle;
      vm.targetNodeOptions = targetNodeOptions;
      vm.instance = jsPlumb.getInstance(defaultDagSettings);
      vm.instance.registerConnectionType('basic', defaultConnectionStyle);
      vm.instance.registerConnectionType('selected', selectedConnectionStyle);
      vm.instance.registerConnectionType('dashed', dashedConnectionStyle);
      vm.instance.registerConnectionType('solid', solidConnectionStyle);
      vm.instance.registerConnectionType('conditionTrue', conditionTrueConnectionStyle);
      vm.instance.registerConnectionType('conditionFalse', conditionFalseConnectionStyle);
      init(); // Making canvas draggable

      vm.secondInstance = jsPlumb.getInstance();

      if (!vm.disableNodeClick) {
        vm.secondInstance.draggable('diagram-container', {
          start: function start() {
            vm.resetActivePluginForComment();
          },
          stop: function stop(e) {
            e.el.style.left = '0px';
            e.el.style.top = '0px';
            transformCanvas(e.pos[1], e.pos[0]);
            DAGPlusPlusNodesActionsFactory.resetPluginCount();
            DAGPlusPlusNodesActionsFactory.setCanvasPanning(vm.panning);
          }
        });

        if (!vm.isDisabled) {
          vm.secondInstance.setDraggable('diagram-container', false);
        }
      } // doing this to listen to changes to just $scope.nodes instead of everything else


      $scope.$watch('nodes', function () {
        if (!vm.isDisabled) {
          if (nodesTimeout) {
            $timeout.cancel(nodesTimeout);
          }

          nodesTimeout = $timeout(function () {
            makeNodesDraggable();
            initNodes();
            /**
             * TODO(https://issues.cask.co/browse/CDAP-16423): Need to debug why setting zoom on init doesn't set the correct zoom
             *
             * Without this, on initial load the nodes drag is weird. The cursor travels outside the node
             * meaning the nodes are dragged only to some extent and not along with the mouse cursor.
             * The underlying reason is that the zoom is incorrect in the graph. Once the zoom is set
             * right the drag happens correctly.
             *
             * This is a escape hatch for us to set zoom and make dragging
             * right one each node addition. This is not a perfect solution
             */

            setZoom(vm.instance.getZoom(), vm.instance);
          });
        }
      }, true); // This is needed to redraw connections and endpoints on browser resize

      angular.element($window).on('resize', vm.instance.repaintEverything);
      DAGPlusPlusNodesStore.registerOnChangeListener(function () {
        vm.activeNodeId = DAGPlusPlusNodesStore.getActiveNodeId(); // can do keybindings only if no node is selected

        if (!vm.activeNodeId) {
          bindKeyboardEvents();
        } else {
          unbindKeyboardEvents();
        }
      });
    });

    vm.onPreviewData = function (event, node) {
      event.stopPropagation();
      HydratorPlusPlusPreviewStore.dispatch(HydratorPlusPlusPreviewActions.setPreviewData());
      DAGPlusPlusNodesActionsFactory.selectNode(node.name);
    };

    vm.onNodeClick = function (event, node) {
      vm.resetActivePluginForComment();
      closeMetricsPopover(node);
      window.CaskCommon.PipelineMetricsActionCreator.setMetricsTabActive(false);
      window.CaskCommon.PipelineMetricsActionCreator.setSelectedPlugin(node.type, node.plugin.name);
      DAGPlusPlusNodesActionsFactory.selectNode(node.name);
    };

    vm.onMetricsClick = function (event, node, portName) {
      event.stopPropagation();

      if ($scope.disableMetricsClick) {
        return;
      }

      closeMetricsPopover(node);
      window.CaskCommon.PipelineMetricsActionCreator.setMetricsTabActive(true, portName);
      DAGPlusPlusNodesActionsFactory.selectNode(node.name);
    };

    vm.onNodeDelete = function (event) {
      var nodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : vm.selectedNode;

      if (event) {
        event.stopPropagation();
      }

      var newNodes = angular.copy(nodes);
      newNodes.forEach(function (node) {
        DAGPlusPlusNodesActionsFactory.removeNode(node.id);

        if (Object.keys(splitterNodesPorts).indexOf(node.name) !== -1) {
          delete splitterNodesPorts[node.name];
        }

        var nodeType = node.plugin.type || node.type;

        if (nodeType === 'condition') {
          conditionNodes = conditionNodes.filter(function (conditionNode) {
            return conditionNode !== node.name;
          });
          deleteEndpoints('endpoint_' + node.id + '_condition_true');
          deleteEndpoints('endpoint_' + node.id + '_condition_false');
        } else if (nodeType === 'splittertransform' && node.outputSchema && Array.isArray(node.outputSchema)) {
          var portNames = node.outputSchema.map(function (port) {
            return port.name;
          });
          var endpoints = portNames.map(function (portName) {
            return "endpoint_".concat(node.id, "_port_").concat(portName);
          });
          angular.forEach(endpoints, function (endpoint) {
            deleteEndpoints(endpoint);
          });
        } else {
          normalNodes = normalNodes.filter(function (normalNode) {
            return normalNode !== node.name;
          });
          deleteEndpoints('endpoint_' + node.id);
        }

        vm.instance.unbind('connectionDetached');
        selectedConnections = selectedConnections.filter(function (selectedConnObj) {
          return selectedConnObj.source && selectedConnObj.target && selectedConnObj.source.getAttribute('data-nodeid') !== node.id && selectedConnObj.target.getAttribute('data-nodeid') !== node.id;
        });
        vm.instance.unmakeTarget(node.id);
        vm.instance.remove(node.id);
        $scope.connections = $scope.connections.filter(function (connection) {
          return connection.from !== node.id && connection.to !== node.id;
        });
      });
      vm.instance.bind('connectionDetached', removeConnection);
      vm.clearSelectedNodes();
    };

    vm.cleanUpGraph = function () {
      if ($scope.nodes.length === 0) {
        return;
      }

      var newConnections = HydratorPlusPlusCanvasFactory.orderConnections($scope.connections, HydratorPlusPlusConfigStore.getAppType() || window.CaskCommon.PipelineDetailStore.getState().artifact.name, $scope.nodes);
      var connectionsSwapped = false;

      for (var i = 0; i < newConnections.length; i++) {
        if (newConnections[i].from !== $scope.connections[i].from || newConnections[i].to !== $scope.connections[i].to) {
          connectionsSwapped = true;
          break;
        }
      }

      if (connectionsSwapped) {
        $scope.connections = newConnections;
        DAGPlusPlusNodesActionsFactory.setConnections($scope.connections);
      }

      var graphNodesNetworkSimplex = DAGPlusPlusFactory.getGraphLayout($scope.nodes, $scope.connections, separation)._nodes;

      var graphNodesLongestPath = DAGPlusPlusFactory.getGraphLayout($scope.nodes, $scope.connections, separation, 'longest-path')._nodes;

      angular.forEach($scope.nodes, function (node) {
        var locationX = graphNodesNetworkSimplex[node.name].x;
        var locationY = graphNodesLongestPath[node.name].y;
        node._uiPosition = {
          left: locationX - 50 + 'px',
          top: locationY + 'px'
        };
      });
      $scope.getGraphMargins($scope.nodes);
      vm.panning.top = 0;
      vm.panning.left = 0;
      vm.panning.style = {
        'top': vm.panning.top + 'px',
        'left': vm.panning.left + 'px'
      };
      repaintEverything();
      DAGPlusPlusNodesActionsFactory.resetPluginCount();
      DAGPlusPlusNodesActionsFactory.setCanvasPanning(vm.panning);
    };

    vm.toggleNodeMenu = function (node, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (!node || vm.nodeMenuOpen === node.name) {
        vm.nodeMenuOpen = null;
      } else {
        vm.nodeMenuOpen = node.name;
        vm.selectedNode = [node];
      }
    }; // This algorithm is f* up


    vm.fitToScreen = function () {
      if ($scope.nodes.length === 0) {
        return;
      }
      /**
       * Need to find the furthest nodes:
       * 1. Left most nodes
       * 2. Right most nodes
       * 3. Top most nodes
       * 4. Bottom most nodes
       **/


      var minLeft = _.min($scope.nodes, function (node) {
        if (node._uiPosition.left.indexOf('vw') !== -1) {
          var left = parseInt(node._uiPosition.left, 10) / 100 * document.documentElement.clientWidth;
          node._uiPosition.left = left + 'px';
        }

        return parseInt(node._uiPosition.left, 10);
      });

      var maxLeft = _.max($scope.nodes, function (node) {
        if (node._uiPosition.left.indexOf('vw') !== -1) {
          var left = parseInt(node._uiPosition.left, 10) / 100 * document.documentElement.clientWidth;
          node._uiPosition.left = left + 'px';
        }

        return parseInt(node._uiPosition.left, 10);
      });

      var minTop = _.min($scope.nodes, function (node) {
        return parseInt(node._uiPosition.top, 10);
      });

      var maxTop = _.max($scope.nodes, function (node) {
        return parseInt(node._uiPosition.top, 10);
      });
      /**
       * Calculate the max width and height of the actual diagram by calculating the difference
       * between the furthest nodes
       **/


      var width = parseInt(maxLeft._uiPosition.left, 10) - parseInt(minLeft._uiPosition.left, 10) + nodeWidth;
      var height = parseInt(maxTop._uiPosition.top, 10) - parseInt(minTop._uiPosition.top, 10) + nodeHeight;
      var parent = $scope.element[0].parentElement.getBoundingClientRect(); // margins from the furthest nodes to the edge of the canvas (75px each)

      var leftRightMargins = 150;
      var topBottomMargins = 150; // calculating the scales and finding the minimum scale

      var widthScale = (parent.width - leftRightMargins) / width;
      var heightScale = (parent.height - topBottomMargins) / height;
      vm.scale = Math.min(widthScale, heightScale);

      if (vm.scale > 1) {
        vm.scale = 1;
      }

      setZoom(vm.scale, vm.instance); // This will move all nodes by the minimum left and minimum top

      var offsetLeft = parseInt(minLeft._uiPosition.left, 10);
      angular.forEach($scope.nodes, function (node) {
        node._uiPosition.left = parseInt(node._uiPosition.left, 10) - offsetLeft + 'px';
      });
      var offsetTop = parseInt(minTop._uiPosition.top, 10);
      angular.forEach($scope.nodes, function (node) {
        node._uiPosition.top = parseInt(node._uiPosition.top, 10) - offsetTop + 'px';
      });
      $scope.getGraphMargins($scope.nodes);
      vm.panning.left = 0;
      vm.panning.top = 0;
      vm.panning.style = {
        'top': vm.panning.top + 'px',
        'left': vm.panning.left + 'px'
      };
      DAGPlusPlusNodesActionsFactory.resetPluginCount();
      DAGPlusPlusNodesActionsFactory.setCanvasPanning(vm.panning);
      repaintEverything();
    };

    vm.undoActions = function () {
      if (!vm.isDisabled && vm.undoStates.length > 0) {
        DAGPlusPlusNodesActionsFactory.undoActions();
      }
    };

    vm.redoActions = function () {
      if (!vm.isDisabled && vm.redoStates.length > 0) {
        DAGPlusPlusNodesActionsFactory.redoActions();
      }
    };

    vm.shouldShowAlertsPort = function (node) {
      var key = generatePluginMapKey(node);
      return myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'emit-alerts');
    };

    vm.shouldShowErrorsPort = function (node) {
      var key = generatePluginMapKey(node);
      return myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'emit-errors');
    };

    vm.onKeyboardCopy = function onKeyboardCopy() {
      if (vm.activePluginToComment) {
        return;
      }

      var pluginConfig = vm.getPluginConfiguration();

      if (!pluginConfig) {
        return;
      }

      var stages = pluginConfig.stages;
      var connections = vm.getSelectedConnections();
      vm.nodeMenuOpen = null;
      window.CaskCommon.Clipboard.copyToClipBoard(JSON.stringify({
        stages: stages,
        connections: connections
      }));
    }; // handling node paste


    document.body.onpaste = function (e) {
      var activeNode = DAGPlusPlusNodesStore.getActiveNodeId();
      var target = myHelpers.objectQuery(e, 'target', 'tagName');
      var INVALID_TAG_NAME = ['INPUT', 'TEXTAREA'];

      if (activeNode || INVALID_TAG_NAME.indexOf(target) !== -1) {
        return;
      }

      var config;

      if (window.clipboardData && window.clipboardData.getData) {
        // for IE......
        config = window.clipboardData.getData('Text');
      } else {
        config = e.clipboardData.getData('text/plain');
      }

      try {
        config = JSON.parse(config);
      } catch (err) {
        console.error('Unable to paste to canvas: ' + err);
      }

      config.nodes = config.stages;
      config.connections = config.connections || [];
      delete config.stages;
      vm.onPipelineContextMenuPaste(config);
    };

    function sanitizeNodesAndConnectionsBeforePaste(text) {
      var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;

      try {
        var config = {};

        if (typeof text === 'string') {
          config = JSON.parse(text);
        } else {
          config = text;
        }

        var nodes = myHelpers.objectQuery(config, 'nodes');
        var connections = myHelpers.objectQuery(config, 'connections');
        var oldNameToNewNameMap = {};

        if (!nodes || !Array.isArray(nodes)) {
          return;
        }

        nodes = nodes.map(function (node) {
          if (!node) {
            return;
          } // change name


          var newName = "".concat(sanitize(node.plugin.label));
          var randIndex = Math.floor(Math.random() * 100);
          newName = "".concat(newName).concat(randIndex);
          var iconConfiguration = {};

          if (!node.icon) {
            iconConfiguration = Object.assign({}, {
              icon: DAGPlusPlusFactory.getIcon(node.plugin.name)
            });
          }

          oldNameToNewNameMap[node.name] = newName;
          node.plugin.label = "".concat(node.plugin.label).concat(randIndex);
          return Object.assign({}, node, {
            name: oldNameToNewNameMap[node.name],
            id: oldNameToNewNameMap[node.name]
          }, iconConfiguration);
        });
        connections = connections.map(function (connection) {
          var from = connection.from;
          var to = connection.to;
          return Object.assign({}, connection, {
            from: oldNameToNewNameMap[from] || from,
            to: oldNameToNewNameMap[to] || to
          });
        });
        /**
         * Commenting this out as this introduces a lot of changes behind
         * the scenes without the user knowing about it.
         * https://issues.cask.co/browse/CDAP-17252 - Will revamp this as part of this change.
         */

        /* const newNodes = window.CaskCommon.CDAPHelpers.sanitizeNodeNamesInPluginProperties(
          nodes,
          AvailablePluginsStore.getState(),
          oldNameToNewNameMap
        );
        */

        return {
          nodes: nodes,
          connections: connections
        };
      } catch (e) {
        console.log('error parsing node config', e);
      }
    } // CUSTOM ICONS CONTROL


    function generatePluginMapKey(node) {
      var plugin = node.plugin;
      var type = node.type || plugin.type;
      return "".concat(plugin.name, "-").concat(type, "-").concat(plugin.artifact.name, "-").concat(plugin.artifact.version, "-").concat(plugin.artifact.scope);
    }

    vm.shouldShowCustomIcon = function (node) {
      var key = generatePluginMapKey(node);
      var iconSourceType = myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'icon', 'type');
      return ['inline', 'link'].indexOf(iconSourceType) !== -1;
    };

    vm.getCustomIconSrc = function (node) {
      var key = generatePluginMapKey(node);
      var iconSourceType = myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'icon', 'type');

      if (iconSourceType === 'inline') {
        return myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'icon', 'arguments', 'data');
      }

      return myHelpers.objectQuery(vm.pluginsMap, key, 'widgets', 'icon', 'arguments', 'url');
    };

    var subAvailablePlugins = AvailablePluginsStore.subscribe(function () {
      vm.pluginsMap = AvailablePluginsStore.getState().plugins.pluginsMap;
      $scope.nodes.forEach(function (node) {
        var key = generatePluginMapKey(node); // This is to check if the plugin version is a range. If so, mark the plugin
        // as available and UI will decide on the specific version while opening the plugin.

        if (myHelpers.objectQuery(node, 'plugin', 'artifact', 'version') && node.plugin.artifact.version.indexOf('[') === 0) {
          node.isPluginAvailable = true;
        } else {
          node.isPluginAvailable = Boolean(myHelpers.objectQuery(vm.pluginsMap, key, 'pluginInfo'));
        }
      });

      if (!_.isEmpty(vm.pluginsMap)) {
        addErrorAlertsEndpointsAndConnections();
      }
    });

    function cleanupOnDestroy() {
      DAGPlusPlusNodesActionsFactory.resetNodesAndConnections();
      DAGPlusPlusNodesStore.reset();

      if (subAvailablePlugins) {
        subAvailablePlugins();
      }

      angular.element($window).off('resize', vm.instance.repaintEverything); // Cancelling all timeouts, key bindings and event listeners

      Object.keys(repaintTimeoutsMap).forEach(function (id) {
        $timeout.cancel(repaintTimeoutsMap[id]);
      });
      $timeout.cancel(nodesTimeout);
      $timeout.cancel(fitToScreenTimeout);
      $timeout.cancel(initTimeout);
      $timeout.cancel(metricsPopoverTimeout);
      $timeout.cancel(highlightSelectedNodeConnectionsTimeout);
      Mousetrap.reset();
      dispatcher.unregister('onUndoActions', undoListenerId);
      dispatcher.unregister('onRedoActions', redoListenerId);
      vm.instance.reset();
      document.body.onpaste = null;
    }

    vm.setComments = function (nodeId, comments) {
      var existingStages = DAGPlusPlusNodesStore.getNodes();
      DAGPlusPlusNodesStore.setNodes(existingStages.map(function (stage) {
        if (stage.id === nodeId) {
          var updatedInfo = stage.information || {};
          updatedInfo = Object.assign({}, updatedInfo, {
            comments: {
              list: comments
            }
          });
          stage = Object.assign({}, stage, {
            information: updatedInfo
          });
        }

        return stage;
      }));
      vm.doesStagesHaveComments = vm.checkIfAnyStageHasComment();
    };

    vm.setPluginActiveForComment = function (nodeId) {
      vm.resetActivePluginForComment(nodeId);

      if (!nodeId) {
        vm.handleCanvasClick();
      } else {
        vm.onPluginContextMenuOpen(nodeId);
      }

      vm.nodeMenuOpen = null;
    };

    vm.resetActivePluginForComment = function () {
      var nodeId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      vm.activePluginToComment = nodeId;
    };

    vm.initPipelineComments = function () {
      var comments;

      if (vm.isDisabled) {
        comments = window.CaskCommon.PipelineDetailStore.getState().config.comments;
      } else {
        comments = HydratorPlusPlusConfigStore.getComments();
      }

      vm.pipelineComments = comments;
    };

    vm.setPipelineComments = function (comments) {
      if (vm.isDisabled) {
        return;
      }

      HydratorPlusPlusConfigStore.setComments(comments);
      vm.pipelineComments = comments;
    };

    $scope.$on('$destroy', cleanupOnDestroy);
    vm.initPipelineComments();
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-dag-factory.js */

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
  angular.module(PKG.name + '.commons').factory('DAGPlusPlusFactory', function () {
    var defaultConnectionStyle = {
      paintStyle: {
        strokeStyle: '#4e5568',
        lineWidth: 2,
        outlineColor: 'transparent',
        outlineWidth: 4
      },
      hoverPaintStyle: {
        strokeStyle: '#58b7f6',
        lineWidth: 4,
        dashstyle: 'solid'
      }
    };
    var selectedConnectionStyle = {
      paintStyle: {
        strokeStyle: '#58b7f6',
        lineWidth: 4,
        outlineColor: 'transparent',
        outlineWidth: 4,
        dashstyle: 'solid'
      }
    };
    var solidConnectionStyle = {
      paintStyle: {
        dashstyle: 'solid'
      }
    };
    var dashedConnectionStyle = {
      paintStyle: {
        dashstyle: '2 4'
      }
    };
    var conditionTrueConnectionStyle = {
      strokeStyle: '#0099ff',
      lineWidth: 2,
      outlineColor: 'transparent',
      outlineWidth: 4,
      dashstyle: '2 4'
    };
    var conditionTrueEndpointStyle = {
      anchor: 'Right',
      cssClass: 'condition-endpoint condition-endpoint-true',
      isSource: true,
      connectorStyle: conditionTrueConnectionStyle,
      overlays: [['Label', {
        label: 'Yes',
        id: 'yesLabel',
        location: [0.5, -0.55],
        cssClass: 'condition-label'
      }]]
    };
    var conditionFalseConnectionStyle = {
      strokeStyle: '#999999',
      lineWidth: 2,
      outlineColor: 'transparent',
      outlineWidth: 4,
      dashstyle: '2 4'
    };
    var conditionFalseEndpointStyle = {
      anchor: [0.5, 1, 0, 1, 2, 0],
      // same as Bottom but moved right 2px
      cssClass: 'condition-endpoint condition-endpoint-false',
      isSource: true,
      connectorStyle: conditionFalseConnectionStyle,
      overlays: [['Label', {
        label: 'No',
        id: 'noLabel',
        location: [0.5, -0.55],
        cssClass: 'condition-label'
      }]]
    };
    var splitterEndpointStyle = {
      isSource: true,
      // [x, y , dx, dy, offsetx, offsety]
      // x, y - position of the anchor.
      // dx, dy - orientation of the curve incident on the anchor
      // offsetx, offsety - offset for the anchor
      anchor: [0.9, 0.65, 1, 0, 2, 0]
    };
    var alertEndpointStyle = {
      anchor: [0.5, 1, 0, 1, 2, 0],
      // same as Bottom but moved right 2px
      scope: 'alertScope'
    };
    var errorEndpointStyle = {
      anchor: [0.5, 1, 0, 1, 3, 0],
      // same as Bottom but moved right 3px
      scope: 'errorScope'
    };
    var targetNodeOptions = {
      isTarget: true,
      dropOptions: {
        hoverClass: 'drag-hover'
      },
      anchor: 'ContinuousLeft',
      allowLoopback: false
    }; // Have to do this because jsPlumb expects key names of defaultSettings to be in PascalCase

    var defaultConnectionStyleSettings = Object.assign({}, defaultConnectionStyle);
    defaultConnectionStyleSettings['PaintStyle'] = defaultConnectionStyleSettings['paintStyle'];
    delete defaultConnectionStyleSettings['paintStyle'];
    defaultConnectionStyleSettings['HoverPaintStyle'] = defaultConnectionStyleSettings['hoverPaintStyle'];
    delete defaultConnectionStyleSettings['hoverPaintStyle'];
    var defaultDagSettings = angular.extend({
      Anchor: [1, 0.5, 1, 0, 0, 2],
      // same as Right but moved down 2px
      Endpoint: 'Dot',
      EndpointStyle: {
        radius: 10
      },
      MaxConnections: -1,
      Connector: ['Flowchart', {
        stub: [10, 15],
        alwaysRespectStubs: true,
        cornerRadius: 20,
        midpoint: 0.2
      }],
      ConnectionOverlays: [['Arrow', {
        location: 1,
        id: 'arrow',
        length: 14,
        foldback: 0.8
      }]],
      Container: 'dag-container'
    }, defaultConnectionStyleSettings);

    function getSettings() {
      var settings = {
        defaultDagSettings: defaultDagSettings,
        defaultConnectionStyle: defaultConnectionStyle,
        selectedConnectionStyle: selectedConnectionStyle,
        conditionTrueConnectionStyle: conditionTrueConnectionStyle,
        conditionTrueEndpointStyle: conditionTrueEndpointStyle,
        conditionFalseConnectionStyle: conditionFalseConnectionStyle,
        conditionFalseEndpointStyle: conditionFalseEndpointStyle,
        splitterEndpointStyle: splitterEndpointStyle,
        alertEndpointStyle: alertEndpointStyle,
        errorEndpointStyle: errorEndpointStyle,
        dashedConnectionStyle: dashedConnectionStyle,
        solidConnectionStyle: solidConnectionStyle,
        targetNodeOptions: targetNodeOptions
      };
      return settings;
    }

    function getIcon(plugin) {
      var iconMap = {
        'script': 'icon-script',
        'scriptfilter': 'icon-scriptfilter',
        'twitter': 'icon-twitter',
        'cube': 'icon-cube',
        'data': 'fa-database',
        'database': 'icon-database',
        'table': 'icon-table',
        'kafka': 'icon-kafka',
        'jms': 'icon-jms',
        'projection': 'icon-projection',
        'amazonsqs': 'icon-amazonsqs',
        'datagenerator': 'icon-datagenerator',
        'validator': 'icon-validator',
        'corevalidator': 'corevalidator',
        'logparser': 'icon-logparser',
        'file': 'icon-file',
        'kvtable': 'icon-kvtable',
        's3': 'icon-s3',
        's3avro': 'icon-s3avro',
        's3parquet': 'icon-s3parquet',
        'snapshotavro': 'icon-snapshotavro',
        'snapshotparquet': 'icon-snapshotparquet',
        'tpfsavro': 'icon-tpfsavro',
        'tpfsparquet': 'icon-tpfsparquet',
        'sink': 'icon-sink',
        'hive': 'icon-hive',
        'structuredrecordtogenericrecord': 'icon-structuredrecord',
        'cassandra': 'icon-cassandra',
        'teradata': 'icon-teradata',
        'elasticsearch': 'icon-elasticsearch',
        'hbase': 'icon-hbase',
        'mongodb': 'icon-mongodb',
        'pythonevaluator': 'icon-pythonevaluator',
        'csvformatter': 'icon-csvformatter',
        'csvparser': 'icon-csvparser',
        'clonerecord': 'icon-clonerecord',
        'compressor': 'icon-compressor',
        'decompressor': 'icon-decompressor',
        'encoder': 'icon-encoder',
        'decoder': 'icon-decoder',
        'jsonformatter': 'icon-jsonformatter',
        'jsonparser': 'icon-jsonparser',
        'hdfs': 'icon-hdfs',
        'hasher': 'icon-hasher',
        'javascript': 'icon-javascript',
        'deduper': 'icon-deduper',
        'distinct': 'icon-distinct',
        'naivebayestrainer': 'icon-naivebayestrainer',
        'groupbyaggregate': 'icon-groupbyaggregate',
        'naivebayesclassifier': 'icon-naivebayesclassifier',
        'azureblobstore': 'icon-azureblobstore',
        'xmlreader': 'icon-XMLreader',
        'xmlparser': 'icon-XMLparser',
        'ftp': 'icon-FTP',
        'joiner': 'icon-joiner',
        'deduplicate': 'icon-deduplicator',
        'valuemapper': 'icon-valuemapper',
        'rowdenormalizer': 'icon-rowdenormalizer',
        'ssh': 'icon-ssh',
        'sshaction': 'icon-sshaction',
        'copybookreader': 'icon-COBOLcopybookreader',
        'excel': 'icon-excelinputsource',
        'encryptor': 'icon-Encryptor',
        'decryptor': 'icon-Decryptor',
        'hdfsfilemoveaction': 'icon-filemoveaction',
        'hdfsfilecopyaction': 'icon-filecopyaction',
        'sqlaction': 'icon-SQLaction',
        'impalahiveaction': 'icon-impalahiveaction',
        'email': 'icon-emailaction',
        'kinesissink': 'icon-Amazon-Kinesis',
        'bigquerysource': 'icon-Big-Query',
        'tpfsorc': 'icon-ORC',
        'groupby': 'icon-groupby',
        'sparkmachinelearning': 'icon-sparkmachinelearning',
        'solrsearch': 'icon-solr',
        'sparkstreaming': 'icon-sparkstreaming',
        'rename': 'icon-rename',
        'archive': 'icon-archive',
        'wrangler': 'icon-DataPreparation',
        'normalize': 'icon-normalize',
        'xmlmultiparser': 'icon-XMLmultiparser',
        'xmltojson': 'icon-XMLtoJSON',
        'decisiontreepredictor': 'icon-decisiontreeanalytics',
        'decisiontreetrainer': 'icon-DesicionTree',
        'hashingtffeaturegenerator': 'icon-HashingTF',
        'ngramtransform': 'icon-NGram',
        'tokenizer': 'icon-tokenizeranalytics',
        'skipgramfeaturegenerator': 'icon-skipgram',
        'skipgramtrainer': 'icon-skipgramtrainer',
        'logisticregressionclassifier': 'icon-logisticregressionanalytics',
        'logisticregressiontrainer': 'icon-LogisticRegressionclassifier',
        'hdfsdelete': 'icon-hdfsdelete',
        'hdfsmove': 'icon-hdfsmove',
        'windowssharecopy': 'icon-windowssharecopy',
        'httppoller': 'icon-httppoller',
        'window': 'icon-window',
        'run': 'icon-Run',
        'oracleexport': 'icon-OracleDump',
        'snapshottext': 'icon-SnapshotTextSink',
        'errorcollector': 'fa-exclamation-triangle',
        'mainframereader': 'icon-MainframeReader',
        'fastfilter': 'icon-fastfilter',
        'trash': 'icon-TrashSink',
        'staterestore': 'icon-Staterestore',
        'topn': 'icon-TopN',
        'wordcount': 'icon-WordCount',
        'datetransform': 'icon-DateTransform',
        'sftpcopy': 'icon-FTPcopy',
        'sftpdelete': 'icon-FTPdelete',
        'validatingxmlconverter': 'icon-XMLvalidator',
        'wholefilereader': 'icon-Filereader',
        'xmlschemaaction': 'icon-XMLschemagenerator',
        's3toredshift': 'icon-S3toredshift',
        'redshifttos3': 'icon-redshifttoS3',
        'verticabulkexportaction': 'icon-Verticabulkexport',
        'verticabulkimportaction': 'icon-Verticabulkload',
        'loadtosnowflake': 'icon-snowflake',
        'kudu': 'icon-apachekudu',
        'orientdb': 'icon-OrientDB',
        'recordsplitter': 'icon-recordsplitter',
        'scalasparkprogram': 'icon-spark',
        'scalasparkcompute': 'icon-spark',
        'cdcdatabase': 'icon-database',
        'cdchbase': 'icon-hbase',
        'cdckudu': 'icon-apachekudu',
        'changetrackingsqlserver': 'icon-database',
        'conditional': 'fa-question-circle-o'
      };
      var pluginName = plugin ? plugin.toLowerCase() : '';
      var icon = iconMap[pluginName] ? iconMap[pluginName] : 'fa-plug';
      return icon;
    }

    function getNodesMap(nodes) {
      var nodesMap = {};
      nodes.forEach(function (node) {
        nodesMap[node.name] = node;
      });
      return nodesMap;
    }

    function customGraphLayout(graph, nodes, connections) {
      var graphNodes = graph._nodes;
      var nodesMap = getNodesMap(nodes);
      angular.forEach(nodes, function (node) {
        var location = graphNodes[node.name];
        var locationX = location.x;
        var locationY = location.y;

        if (node.type === 'alertpublisher' || node.type === 'errortransform') {
          var connToThisNode = connections.find(function (conn) {
            return conn.to === node.name;
          });

          if (connToThisNode) {
            var sourceNode = connToThisNode.from;
            var nonErrorsAlertsConnCount = 0;

            for (var i = 0; i < connections.length; i++) {
              var conn = connections[i];

              if (conn.from === sourceNode) {
                var targetNode = nodesMap[conn.to];

                if (targetNode.type !== 'alertpublisher' && targetNode.type !== 'errortransform') {
                  nonErrorsAlertsConnCount += 1;

                  if (nonErrorsAlertsConnCount > 1) {
                    break;
                  }
                }
              }
            } // If the node connecting to this alert publisher/error transform node only has connections
            // to these types of nodes, then have to push the alert publisher/error transform down a bit more


            if (nonErrorsAlertsConnCount === 0) {
              locationY += 200; // Else if there's one non error or alert connection then push down a little bit.
              // Don't have to push down if there are 2 or more non error alert connections, since
              // the error and alert nodes will be pushed down automatically by dagre.
            } else if (nonErrorsAlertsConnCount === 1) {
              locationY += 70;
            }

            locationX -= 150;
          }
        }

        graph._nodes[node.name].x = locationX;
        graph._nodes[node.name].y = locationY;
      });
    }

    function getGraphLayout(nodes, connections, separation) {
      var rankingAlgo = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'network-simplex';
      var rankSeparation = separation || 200;
      var graph = new dagre.graphlib.Graph();
      graph.setGraph({
        nodesep: 90,
        ranksep: rankSeparation,
        rankdir: 'LR',
        marginx: 0,
        marginy: 0,
        ranker: rankingAlgo
      });
      graph.setDefaultEdgeLabel(function () {
        return {};
      });
      nodes.forEach(function (node) {
        var id = node.name || node.id;

        if (!graph.node(id)) {
          graph.setNode(id, {
            label: node.label,
            width: 100,
            height: 100
          });
        }

        if (node.type === 'errortransform' || node.type === 'alertpublisher') {
          var connectionsToAlertOrError = connections.filter(function (conn) {
            return conn.to === id;
          }); // If a node is connected to an alert publisher or error collector, then need to
          // increase the width and height here, to not make connections look screwed up

          angular.forEach(connectionsToAlertOrError, function (conn) {
            var fromNode = conn.from;

            if (graph.node(fromNode)) {
              graph.node(fromNode).width = 300;
              graph.node(fromNode).height += 250;
            } else {
              graph.setNode(fromNode, {
                label: fromNode,
                width: 300,
                height: 350
              });
            }
          });
        }
      });
      connections.forEach(function (connection) {
        if (connection.port) {
          graph.setEdge(connection.from, connection.to, {
            minlen: 1.5
          });
        } else {
          graph.setEdge(connection.from, connection.to);
        }
      });
      dagre.layout(graph);
      customGraphLayout(graph, nodes, connections);
      return graph;
    }

    return {
      getSettings: getSettings,
      getIcon: getIcon,
      getNodesMap: getNodesMap,
      getGraphLayout: getGraphLayout
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
  /* /my-dag.js */

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
  var commonModule = angular.module(PKG.name + '.commons');
  commonModule.factory('jsPlumb', ["$window", function ($window) {
    return $window.jsPlumb;
  }]);
  commonModule.directive('myDagPlus', function () {
    return {
      restrict: 'E',
      scope: {
        isDisabled: '=',
        nodes: '=',
        connections: '=',
        nodeClick: '&',
        nodeDelete: '&',
        context: '=',
        showMetrics: '=',
        disableMetricsClick: '=',
        metricsData: '=',
        metricsPopoverTemplate: '@',
        disableNodeClick: '=',
        separation: '=?',
        previewMode: '=?'
      },
      link: function link(scope, element) {
        scope.element = element;

        scope.getGraphMargins = function (plugins) {
          var margins = this.element[0].parentElement.getBoundingClientRect();
          var parentWidth = margins.width;
          var parentHeight = margins.height;
          var nodeWidth = 200;
          var nodeHeight = 80;
          var scale = 1.0; // Find furthest nodes

          var maxLeft = 0;
          var maxTop = 0;
          angular.forEach(plugins, function (plugin) {
            if (!plugin._uiPosition) {
              return;
            }

            var left = parseInt(plugin._uiPosition.left, 10);
            var top = parseInt(plugin._uiPosition.top, 10);
            maxLeft = maxLeft < left ? left : maxLeft;
            maxTop = maxTop < top ? top : maxTop;
          });
          var marginLeft = (parentWidth - maxLeft - nodeWidth) / 2;
          var marginTop = (parentHeight - maxTop - nodeHeight) / 2;
          angular.forEach(plugins, function (plugin) {
            if (!plugin._uiPosition) {
              return;
            }

            var left = parseInt(plugin._uiPosition.left, 10) + marginLeft;
            var top = parseInt(plugin._uiPosition.top, 10) + marginTop;
            plugin._uiPosition.left = left + 'px';
            plugin._uiPosition.top = top + 'px';
          });

          if (maxLeft > parentWidth - 100) {
            scale = (parentWidth - 100) / maxLeft;
          }

          if (maxTop > parentHeight - 100) {
            var topScale = (parentHeight - 100) / maxTop;
            scale = scale < topScale ? scale : topScale;
          }

          return {
            scale: scale
          };
        };
      },
      templateUrl: 'dag-plus/my-dag.html',
      controller: 'DAGPlusPlusCtrl',
      controllerAs: 'DAGPlusPlusCtrl'
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
  /* /services/actions/nodes-actions.js */

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
  var DAGPlusPlusNodesActionsFactory = /*#__PURE__*/function () {
    DAGPlusPlusNodesActionsFactory.$inject = ["DAGPlusPlusNodesDispatcher", "GLOBALS", "DAGPlusPlusFactory", "DAGPlusPlusNodesStore"];
    function DAGPlusPlusNodesActionsFactory(DAGPlusPlusNodesDispatcher, GLOBALS, DAGPlusPlusFactory, DAGPlusPlusNodesStore) {
      _classCallCheck(this, DAGPlusPlusNodesActionsFactory);

      this.GLOBALS = GLOBALS;
      this.MyDAGFactory = DAGPlusPlusFactory;
      this.DAGPlusPlusNodesStore = DAGPlusPlusNodesStore;
      this.nodesDispatcher = DAGPlusPlusNodesDispatcher.getDispatcher();
    }

    _createClass(DAGPlusPlusNodesActionsFactory, [{
      key: "addNode",
      value: function addNode(config) {
        var canvasPanning = this.DAGPlusPlusNodesStore.getCanvasPanning();
        var sourcePosition = {
          top: 150 - canvasPanning.top,
          left: 10 / 100 * document.documentElement.clientWidth - canvasPanning.left
        };
        var transformPosition = {
          top: 150 - canvasPanning.top,
          left: 30 / 100 * document.documentElement.clientWidth - canvasPanning.left
        };
        var sinkPosition = {
          top: 150 - canvasPanning.top,
          left: 50 / 100 * document.documentElement.clientWidth - canvasPanning.left
        };
        var offset = 35; // set initial position

        switch (this.GLOBALS.pluginConvert[config.type]) {
          case 'source':
            var sourceOffset = this.DAGPlusPlusNodesStore.getSourceCount() * offset;
            config._uiPosition = {
              top: sourcePosition.top + sourceOffset + 'px',
              left: sourcePosition.left + sourceOffset + 'px'
            };
            break;

          case 'sink':
            var sinkOffset = this.DAGPlusPlusNodesStore.getSinkCount() * offset;
            config._uiPosition = {
              top: sinkPosition.top + sinkOffset + 'px',
              left: sinkPosition.left + sinkOffset + 'px'
            };
            break;

          default:
            var transformOffset = this.DAGPlusPlusNodesStore.getTransformCount() * offset;
            config._uiPosition = {
              top: transformPosition.top + transformOffset + 'px',
              left: transformPosition.left + transformOffset + 'px'
            };
            break;
        }

        this.nodesDispatcher.dispatch('onNodeAdd', config);
      }
    }, {
      key: "updateNode",
      value: function updateNode(nodeId, config) {
        this.nodesDispatcher.dispatch('onNodeUpdate', nodeId, config);
      }
    }, {
      key: "removeNode",
      value: function removeNode(node) {
        this.nodesDispatcher.dispatch('onRemoveNode', node);
      }
    }, {
      key: "setNodes",
      value: function setNodes(nodes) {
        this.nodesDispatcher.dispatch('onSetNodes', nodes);
      }
    }, {
      key: "addConnection",
      value: function addConnection(connection) {
        this.nodesDispatcher.dispatch('onConnect', connection);
      }
    }, {
      key: "setConnections",
      value: function setConnections(connections) {
        this.nodesDispatcher.dispatch('onConnectionsUpdate', connections);
      }
    }, {
      key: "removeConnection",
      value: function removeConnection(connection) {
        this.nodesDispatcher.dispatch('onRemoveConnection', connection);
      }
    }, {
      key: "resetNodesAndConnections",
      value: function resetNodesAndConnections() {
        this.nodesDispatcher.dispatch('onReset');
      }
    }, {
      key: "selectNode",
      value: function selectNode(nodeName) {
        this.nodesDispatcher.dispatch('onNodeSelect', nodeName);
      }
    }, {
      key: "resetSelectedNode",
      value: function resetSelectedNode() {
        this.nodesDispatcher.dispatch('onNodeSelectReset');
      }
    }, {
      key: "resetPluginCount",
      value: function resetPluginCount() {
        this.nodesDispatcher.dispatch('onResetPluginCount');
      }
    }, {
      key: "setCanvasPanning",
      value: function setCanvasPanning(panning) {
        this.nodesDispatcher.dispatch('onSetCanvasPanning', panning);
      }
    }, {
      key: "createGraphFromConfig",
      value: function createGraphFromConfig(nodes, connections) {
        this.DAGPlusPlusNodesStore.setDefaults();
        this.nodesDispatcher.dispatch('onCreateGraphFromConfig', nodes, connections);
      }
    }, {
      key: "createGraphFromConfigOnPaste",
      value: function createGraphFromConfigOnPaste(nodes, connections) {
        this.DAGPlusPlusNodesStore.addStateToHistory();
        this.nodesDispatcher.dispatch('onCreateGraphFromConfig', nodes, connections);
      }
    }, {
      key: "undoActions",
      value: function undoActions() {
        this.nodesDispatcher.dispatch('onUndoActions');
      }
    }, {
      key: "redoActions",
      value: function redoActions() {
        this.nodesDispatcher.dispatch('onRedoActions');
      }
    }, {
      key: "removePreviousState",
      value: function removePreviousState() {
        this.nodesDispatcher.dispatch('onRemovePreviousState');
      }
    }, {
      key: "resetFutureStates",
      value: function resetFutureStates() {
        this.nodesDispatcher.dispatch('onResetFutureStates');
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return DAGPlusPlusNodesActionsFactory;
  }();

  DAGPlusPlusNodesActionsFactory.$inject = ['DAGPlusPlusNodesDispatcher', 'GLOBALS', 'DAGPlusPlusFactory', 'DAGPlusPlusNodesStore'];
  angular.module("".concat(PKG.name, ".commons")).service('DAGPlusPlusNodesActionsFactory', DAGPlusPlusNodesActionsFactory);
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
  /* /services/dispatchers/nodes-dispatcher.js */

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
  var DAGPlusPlusNodesDispatcher = /*#__PURE__*/function () {
    DAGPlusPlusNodesDispatcher.$inject = ["CaskAngularDispatcher"];
    function DAGPlusPlusNodesDispatcher(CaskAngularDispatcher) {
      _classCallCheck(this, DAGPlusPlusNodesDispatcher);

      this.baseDispatcher = CaskAngularDispatcher;
      this.__dispatcher__ = null;
    }

    _createClass(DAGPlusPlusNodesDispatcher, [{
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

    return DAGPlusPlusNodesDispatcher;
  }();

  DAGPlusPlusNodesDispatcher.$inject = ['CaskAngularDispatcher'];
  angular.module("".concat(PKG.name, ".commons")).service('DAGPlusPlusNodesDispatcher', DAGPlusPlusNodesDispatcher);
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
  /* /services/stores/nodes-store.js */

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
  var DAGPlusPlusNodesStore = /*#__PURE__*/function () {
    DAGPlusPlusNodesStore.$inject = ["DAGPlusPlusNodesDispatcher", "uuid", "GLOBALS"];
    function DAGPlusPlusNodesStore(DAGPlusPlusNodesDispatcher, uuid, GLOBALS) {
      _classCallCheck(this, DAGPlusPlusNodesStore);

      this.state = {};
      this.setDefaults();
      this.changeListeners = [];
      this.uuid = uuid;
      this.GLOBALS = GLOBALS;
      this.adjacencyMap = {};
      var dispatcher = DAGPlusPlusNodesDispatcher.getDispatcher();
      dispatcher.register('onNodeAdd', this.addNode.bind(this));
      dispatcher.register('onSetNodes', this.setNodes.bind(this));
      dispatcher.register('onRemoveNode', this.removeNode.bind(this));
      dispatcher.register('onConnect', this.addConnection.bind(this));
      dispatcher.register('onConnectionsUpdate', this.updateConnections.bind(this));
      dispatcher.register('onRemoveConnection', this.removeConnection.bind(this));
      dispatcher.register('onReset', this.setDefaults.bind(this));
      dispatcher.register('onNodeSelect', this.setActiveNodeId.bind(this));
      dispatcher.register('onCreateGraphFromConfig', this.setNodesAndConnections.bind(this));
      dispatcher.register('onNodeSelectReset', this.resetActiveNode.bind(this));
      dispatcher.register('onNodeUpdate', this.updateNode.bind(this));
      dispatcher.register('onResetPluginCount', this.resetPluginCount.bind(this));
      dispatcher.register('onSetCanvasPanning', this.setCanvasPanning.bind(this));
      dispatcher.register('onUndoActions', this.undoActions.bind(this));
      dispatcher.register('onRedoActions', this.redoActions.bind(this));
      dispatcher.register('onRemovePreviousState', this.removePreviousState.bind(this));
      dispatcher.register('onResetFutureStates', this.resetFutureStates.bind(this));
    }

    _createClass(DAGPlusPlusNodesStore, [{
      key: "setDefaults",
      value: function setDefaults() {
        var defaultState = {
          nodes: [],
          connections: [],
          activeNodeId: null,
          currentSourceCount: 0,
          currentTransformCount: 0,
          currentSinkCount: 0,
          canvasPanning: {
            top: 0,
            left: 0
          }
        };
        this.state = Object.assign({}, defaultState);
        this.stateHistory = {
          past: [],
          future: []
        };
      }
    }, {
      key: "reset",
      value: function reset() {
        this.changeListeners = [];
        this.setDefaults();
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
      key: "addSourceCount",
      value: function addSourceCount() {
        this.state.currentSourceCount++;
      }
    }, {
      key: "addTransformCount",
      value: function addTransformCount() {
        this.state.currentTransformCount++;
      }
    }, {
      key: "addSinkCount",
      value: function addSinkCount() {
        this.state.currentSinkCount++;
      }
    }, {
      key: "resetSourceCount",
      value: function resetSourceCount() {
        this.state.currentSourceCount = 0;
      }
    }, {
      key: "resetTransformCount",
      value: function resetTransformCount() {
        this.state.currentTransformCount = 0;
      }
    }, {
      key: "resetSinkCount",
      value: function resetSinkCount() {
        this.state.currentSinkCount = 0;
      }
    }, {
      key: "resetPluginCount",
      value: function resetPluginCount() {
        this.state.currentSourceCount = 0;
        this.state.currentTransformCount = 0;
        this.state.currentSinkCount = 0;
      }
    }, {
      key: "setCanvasPanning",
      value: function setCanvasPanning(panning) {
        this.state.canvasPanning.top = panning.top;
        this.state.canvasPanning.left = panning.left;
        this.emitChange();
      }
    }, {
      key: "getSourceCount",
      value: function getSourceCount() {
        return this.state.currentSourceCount;
      }
    }, {
      key: "getTransformCount",
      value: function getTransformCount() {
        return this.state.currentTransformCount;
      }
    }, {
      key: "getSinkCount",
      value: function getSinkCount() {
        return this.state.currentSinkCount;
      }
    }, {
      key: "getCanvasPanning",
      value: function getCanvasPanning() {
        return this.state.canvasPanning;
      }
    }, {
      key: "addNode",
      value: function addNode(nodeConfig) {
        var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;

        if (!nodeConfig.name) {
          nodeConfig.name = nodeConfig.plugin.label + '-' + this.uuid.v4();
        }

        if (!nodeConfig.id) {
          nodeConfig.id = sanitize(nodeConfig.plugin.label) + '-' + this.uuid.v4();
        }

        this.addStateToHistory();

        switch (this.GLOBALS.pluginConvert[nodeConfig.type]) {
          case 'source':
            this.addSourceCount();
            break;

          case 'sink':
            this.addSinkCount();
            break;

          default:
            this.addTransformCount();
            break;
        }

        this.state.nodes.push(nodeConfig);

        if (!this.adjacencyMap[nodeConfig.id]) {
          this.adjacencyMap[nodeConfig.id] = [];
        }

        this.emitChange();
      }
    }, {
      key: "updateNode",
      value: function updateNode(nodeId, config) {
        var matchNode = this.state.nodes.filter(function (node) {
          return node.id === nodeId;
        });

        if (!matchNode.length) {
          return;
        }

        this.addStateToHistory();
        matchNode = matchNode[0];
        angular.extend(matchNode, config);
        this.emitChange();
      }
    }, {
      key: "removeNode",
      value: function removeNode(node) {
        var _this = this;

        var match = this.state.nodes.filter(function (n) {
          return n.id === node;
        })[0];
        this.addStateToHistory();

        switch (this.GLOBALS.pluginConvert[match.type]) {
          case 'source':
            this.resetSourceCount();
            break;

          case 'transform':
            this.resetTransformCount();
            break;

          case 'sink':
            this.resetSinkCount();
            break;
        }

        this.state.nodes.splice(this.state.nodes.indexOf(match), 1); // removes connections that contain the node we just removed, otherwise there will be a Javascript error

        this.state.connections = this.state.connections.filter(function (conn) {
          return conn.from !== match.name && conn.to !== match.name;
        });
        this.state.activeNodeId = null;
        delete this.adjacencyMap[node];
        Object.keys(this.adjacencyMap).forEach(function (key) {
          _this.adjacencyMap[key] = _this.adjacencyMap[key].filter(function (n) {
            return n !== node;
          });
        });
        this.emitChange();
      }
    }, {
      key: "getNodes",
      value: function getNodes() {
        return this.state.nodes;
      }
    }, {
      key: "getNodesAsObjects",
      value: function getNodesAsObjects() {
        var obj = {};
        angular.forEach(this.state.nodes, function (node) {
          obj[node.name] = node;
        });
        return obj;
      }
    }, {
      key: "setNodes",
      value: function setNodes(nodes) {
        var _this2 = this;

        var sanitize = window.CaskCommon.CDAPHelpers.santizeStringForHTMLID;
        this.adjacencyMap = {};
        nodes.forEach(function (node) {
          if (!node.name) {
            node.name = node.label + '-' + _this2.uuid.v4();
          }

          if (!node.id) {
            node.id = sanitize(node.name);
          }

          if (!node.type) {
            node.type = node.plugin.type;
          }

          if (!_this2.adjacencyMap[node.id]) {
            _this2.adjacencyMap[node.id] = [];
          }
        });
        this.state.nodes = nodes;
        this.emitChange();
      }
    }, {
      key: "getActiveNodeId",
      value: function getActiveNodeId() {
        return this.state.activeNodeId;
      }
    }, {
      key: "setActiveNodeId",
      value: function setActiveNodeId(nodeId) {
        this.addStateToHistory(false);
        this.state.activeNodeId = nodeId;
        this.emitChange();
      }
    }, {
      key: "resetActiveNode",
      value: function resetActiveNode() {
        this.state.activeNodeId = null;
        angular.forEach(this.state.nodes, function (node) {
          node.selected = false;
        });
        this.emitChange();
      }
    }, {
      key: "addConnection",
      value: function addConnection(connection) {
        this.addStateToHistory();
        this.state.connections.push(connection);
        var from = connection.from,
            to = connection.to;
        var sourceNodeId = this.state.nodes.find(function (node) {
          return node.name === from;
        });
        var targetNodeId = this.state.nodes.find(function (node) {
          return node.name === to;
        });
        sourceNodeId = sourceNodeId.id || sourceNodeId.name;
        targetNodeId = targetNodeId.id || targetNodeId.name;

        if (!this.adjacencyMap[sourceNodeId]) {
          this.adjacencyMap[sourceNodeId] = [targetNodeId];
        } else {
          this.adjacencyMap[sourceNodeId].push(targetNodeId);
        }

        this.emitChange();
      }
    }, {
      key: "updateConnections",
      value: function updateConnections(connections) {
        var _this3 = this;

        Object.keys(this.adjacencyMap).forEach(function (key) {
          _this3.adjacencyMap[key] = [];
        });
        connections.forEach(function (_ref) {
          var from = _ref.from,
              to = _ref.to;

          var sourceNodeId = _this3.state.nodes.find(function (node) {
            return node.name === from;
          });

          var targetNodeId = _this3.state.nodes.find(function (node) {
            return node.name === to;
          });

          sourceNodeId = sourceNodeId.id || sourceNodeId.name;
          targetNodeId = targetNodeId.id || targetNodeId.name;

          if (!_this3.adjacencyMap[sourceNodeId]) {
            _this3.adjacencyMap[sourceNodeId] = [targetNodeId];
          } else {
            _this3.adjacencyMap[sourceNodeId].push(targetNodeId);
          }
        });
        this.addStateToHistory();
        this.state.connections = connections;
        this.emitChange();
      }
    }, {
      key: "removeConnection",
      value: function removeConnection(connection) {
        this.addStateToHistory();
        var index = this.state.connections.indexOf(connection);
        var from = connection.from,
            to = connection.to;
        var sourceNodeId = this.state.nodes.find(function (node) {
          return node.name === from;
        });
        var targetNodeId = this.state.nodes.find(function (node) {
          return node.name === to;
        });
        sourceNodeId = sourceNodeId.id || sourceNodeId.name;
        targetNodeId = targetNodeId.id || targetNodeId.name;
        this.adjacencyMap[sourceNodeId] = this.adjacencyMap[sourceNodeId].filter(function (target) {
          return target !== targetNodeId;
        });
        this.state.connections.splice(index, 1);
        this.emitChange();
      }
    }, {
      key: "getConnections",
      value: function getConnections() {
        return angular.copy(this.state.connections);
      }
    }, {
      key: "setConnections",
      value: function setConnections(connections) {
        var _this4 = this;

        Object.keys(this.adjacencyMap).forEach(function (key) {
          _this4.adjacencyMap[key] = [];
        });
        connections.forEach(function (_ref2) {
          var from = _ref2.from,
              to = _ref2.to;

          var sourceNodeId = _this4.state.nodes.find(function (node) {
            return node.name === from;
          });

          var targetNodeId = _this4.state.nodes.find(function (node) {
            return node.name === to;
          });

          sourceNodeId = sourceNodeId.id || sourceNodeId.name;
          targetNodeId = targetNodeId.id || targetNodeId.name;

          _this4.adjacencyMap[sourceNodeId].push(targetNodeId);
        });
        this.state.connections = connections;
        this.emitChange();
      }
    }, {
      key: "setNodesAndConnections",
      value: function setNodesAndConnections(nodes, connections) {
        var _this5 = this;

        this.setNodes(nodes);
        this.state.connections = connections;
        this.adjacencyMap = {};
        nodes.forEach(function (node) {
          var nodeId = node;

          if (_typeof(nodeId) === 'object' && typeof nodeId.id === 'string') {
            nodeId = node.id;
          }

          if (!nodeId) {
            return;
          }

          _this5.adjacencyMap[nodeId] = [];
        });
        connections.forEach(function (_ref3) {
          var from = _ref3.from,
              to = _ref3.to;

          var sourceNodeId = _this5.state.nodes.find(function (node) {
            return node.name === from;
          });

          var targetNodeId = _this5.state.nodes.find(function (node) {
            return node.name === to;
          });

          sourceNodeId = sourceNodeId.id || sourceNodeId.name;
          targetNodeId = targetNodeId.id || targetNodeId.name;

          _this5.adjacencyMap[sourceNodeId].push(targetNodeId);
        });
        this.emitChange();
      }
    }, {
      key: "setState",
      value: function setState(state) {
        this.state = state;
        this.emitChange();
      }
    }, {
      key: "getUndoStates",
      value: function getUndoStates() {
        return this.stateHistory.past;
      }
    }, {
      key: "getRedoStates",
      value: function getRedoStates() {
        return this.stateHistory.future;
      }
    }, {
      key: "addStateToHistory",
      value: function addStateToHistory() {
        var resetFuture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var currentState = angular.copy(this.state);
        this.stateHistory.past.push(currentState);

        if (resetFuture) {
          this.resetFutureStates();
        }
      }
    }, {
      key: "removePreviousState",
      value: function removePreviousState() {
        this.stateHistory.past.pop();
      }
    }, {
      key: "resetFutureStates",
      value: function resetFutureStates() {
        this.stateHistory.future = [];
      }
    }, {
      key: "undoActions",
      value: function undoActions() {
        var past = this.stateHistory.past;

        if (past.length > 0) {
          var previousState = this.stateHistory.past.pop();
          var presentState = angular.copy(this.state);
          this.stateHistory.future.unshift(presentState);
          this.setState(previousState);
        }
      }
    }, {
      key: "redoActions",
      value: function redoActions() {
        var future = this.stateHistory.future;

        if (future.length > 0) {
          var nextState = this.stateHistory.future.shift();
          var presentState = angular.copy(this.state);
          this.stateHistory.past.push(presentState);
          this.setState(nextState);
        }
      }
    }, {
      key: "getAdjacencyMap",
      value: function getAdjacencyMap() {
        return this.adjacencyMap;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return DAGPlusPlusNodesStore;
  }();

  DAGPlusPlusNodesStore.$inject = ['DAGPlusPlusNodesDispatcher', 'uuid', 'GLOBALS'];
  angular.module("".concat(PKG.name, ".commons")).service('DAGPlusPlusNodesStore', DAGPlusPlusNodesStore);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /plugin-templates-ctrl.js */

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
  angular.module("".concat(PKG.name, ".commons")).controller('PluginTemplatesCtrl', ["PluginTemplatesDirStore", "PluginTemplatesDirActions", "$scope", "myPipelineApi", "HydratorPlusPlusPluginConfigFactory", "myHelpers", "mySettings", "$stateParams", "$state", "GLOBALS", "$rootScope", "HydratorPlusPlusNodeService", "HydratorPlusPlusHydratorService", function (PluginTemplatesDirStore, PluginTemplatesDirActions, $scope, myPipelineApi, HydratorPlusPlusPluginConfigFactory, myHelpers, mySettings, $stateParams, $state, GLOBALS, $rootScope, HydratorPlusPlusNodeService, HydratorPlusPlusHydratorService) {
    var vm = this;
    var oldTemplateName;
    vm.prefill = {};
    vm.GLOBALS = GLOBALS;
    vm.pluginList = [];
    vm.isEdit = $scope.mode === 'edit' ? true : false;
    vm.isDisabled = false;
    vm.configFetched = false;
    vm.noConfig = false;
    vm.pipelineTypeOptions = [vm.GLOBALS.etlBatch, vm.GLOBALS.etlRealtime];
    var batchOptions = [GLOBALS.pluginTypes[vm.GLOBALS.etlBatch].source, GLOBALS.pluginTypes[vm.GLOBALS.etlBatch].sink, GLOBALS.pluginTypes[vm.GLOBALS.etlBatch].transform];
    var realtimeOptions = [GLOBALS.pluginTypes[vm.GLOBALS.etlRealtime].source, GLOBALS.pluginTypes[vm.GLOBALS.etlRealtime].sink, GLOBALS.pluginTypes[vm.GLOBALS.etlRealtime].transform];
    vm.pluginDescription = '';
    var plugin;

    vm.onPipelineTypeChange = function () {
      vm.submitted = false;
      vm.pluginList = [];
      vm.pluginVersions = [];
      vm.pluginType = null;
      vm.pluginTypeOptions = vm.templateType === vm.GLOBALS.etlBatch ? batchOptions : realtimeOptions;
    };

    vm.getPluginsList = function (pluginType) {
      vm.submitted = false;
      vm.pluginName = PluginTemplatesDirStore.getPluginName();
      vm.pluginVersions = [];
      plugin = null;
      vm.pluginConfig = null;
      vm.configFetched = false;
      var prom;
      var params = {
        pipelineType: vm.templateType,
        namespace: $stateParams.namespace,
        version: $rootScope.cdapVersion,
        extensionType: pluginType
      };
      prom = myPipelineApi.fetchPlugins(params).$promise;
      prom.then(function (res) {
        vm.pluginList = _.uniq(res.map(function (p) {
          return p.name;
        }));
      });
    };

    vm.onPluginSelect = function () {
      vm.submitted = false;
      initialize();
    };

    function initialize() {
      if (!vm.pluginName) {
        return;
      }

      vm.configFetched = false;
      var fetchApi = myPipelineApi.fetchPluginProperties;
      var params = {
        namespace: $stateParams.namespace,
        pipelineType: vm.templateType,
        extensionType: vm.pluginType,
        pluginName: vm.pluginName,
        version: $rootScope.cdapVersion
      };
      fetchApi(params).$promise.then(function (res) {
        vm.pluginVersions = res;
        var latestArtifact,
            baseVersion = new window.CaskCommon.Version('0.0.0');

        var availableArtifacts = _.map(res, 'artifact');

        angular.forEach(availableArtifacts, function (artifactObj) {
          var availableversion = new window.CaskCommon.Version(artifactObj.version);
          var compare = availableversion.compareTo(baseVersion);

          if (compare > 0) {
            latestArtifact = artifactObj;
            baseVersion = availableversion;
          }
        });
        vm.plugin = res.filter(function (obj) {
          if (!vm.pluginConfig) {
            return angular.equals(obj.artifact, latestArtifact);
          } else {
            return angular.equals(obj.artifact, vm.pluginConfig.artifact);
          }
        })[0];
        vm.onPluginVersionSelect();
      });
    }

    function createOnChangeHandler(field) {
      return function (value) {
        vm.pluginConfig.plugin.properties[field] = value;
      };
    }

    vm.onPluginVersionSelect = function () {
      vm.submitted = false;

      if (!vm.plugin) {
        return;
      }

      if (!vm.pluginConfig) {
        vm.pluginConfig = {
          _backendProperties: vm.plugin.properties,
          plugin: {
            name: vm.plugin.name,
            properties: {}
          },
          outputSchema: [{
            'name': 'etlSchemaBody',
            'schema': ''
          }],
          lock: {}
        };
      } else {
        vm.pluginConfig._backendProperties = vm.plugin.properties;
        vm.pluginConfig.plugin.name = vm.plugin.name;
      }

      var artifact = {
        name: vm.plugin.artifact.name,
        version: vm.plugin.artifact.version,
        scope: vm.plugin.artifact.scope,
        key: 'widgets.' + vm.plugin.name + '-' + vm.plugin.type
      };
      HydratorPlusPlusPluginConfigFactory.fetchWidgetJson(artifact.name, artifact.version, artifact.scope, artifact.key).then(function success(res) {
        vm.configFetched = true;
        vm.noConfig = false;
        vm.groupsConfig = HydratorPlusPlusPluginConfigFactory.generateNodeConfig(vm.pluginConfig._backendProperties, res);
        vm.pluginDescription = vm.plugin.description || '';
        angular.forEach(vm.groupsConfig.groups, function (group) {
          angular.forEach(group.fields, function (field) {
            if (field.defaultValue) {
              vm.pluginConfig.plugin.properties[field.name] = vm.pluginConfig.plugin.properties[field.name] || field.defaultValue;
            }

            field.onChangeHandler = createOnChangeHandler(field.name);
          });
        });
        var configOutputSchema = vm.groupsConfig.outputSchema; // If its an implicit schema, set the output schema to the implicit schema and inform ConfigActionFactory

        if (configOutputSchema.implicitSchema) {
          var keys = Object.keys(configOutputSchema.implicitSchema);
          var formattedSchema = [];
          angular.forEach(keys, function (key) {
            formattedSchema.push({
              name: key,
              type: configOutputSchema.implicitSchema[key]
            });
          });
          var arraySchemaFormat = [HydratorPlusPlusNodeService.getOutputSchemaObj(HydratorPlusPlusHydratorService.formatSchemaToAvro(configOutputSchema.implicitSchema))];
          vm.pluginConfig.outputSchema = arraySchemaFormat;
        }
      }, function error() {
        // When there is no config
        vm.noConfig = true;
        vm.configFetched = true;
      });
    };

    PluginTemplatesDirStore.registerOnChangeListener(function () {
      var mode = PluginTemplatesDirStore.getMode();
      var isCloseCommand = PluginTemplatesDirStore.getIsCloseCommand();
      var isSaveSuccessfull = PluginTemplatesDirStore.getIsSaveSuccessfull();

      if (isCloseCommand || isSaveSuccessfull) {
        return;
      }

      if (mode === 'edit') {
        vm.templateType = PluginTemplatesDirStore.getTemplateType();
        vm.pluginType = PluginTemplatesDirStore.getPluginType();
        vm.templateName = PluginTemplatesDirStore.getTemplateName();
        vm.pluginName = PluginTemplatesDirStore.getPluginName();
        vm.prefill = {
          templateType: true,
          pluginType: true,
          pluginName: true
        };
        vm.isEdit = true;
        mySettings.get('pluginTemplates').then(function (res) {
          var template = res[$stateParams.namespace][vm.templateType][vm.pluginType][vm.templateName];
          vm.pluginConfig = {
            artifact: template.artifact,
            pluginTemplate: template.pluginTemplate,
            plugin: {
              properties: template.plugin ? template.plugin.properties : template.properties
            },
            outputSchema: template.outputSchema,
            lock: template.lock
          };
          oldTemplateName = template.pluginTemplate;
          vm.pluginDescription = template.description;
          initialize();
        });
      } else {
        vm.pluginName = PluginTemplatesDirStore.getPluginName();
        vm.prefill.pluginName = true;
        var templateType = PluginTemplatesDirStore.getTemplateType();
        var pluginType = PluginTemplatesDirStore.getPluginType();

        if (templateType && templateType.length && !vm.templateType) {
          vm.templateType = templateType;
          vm.prefill.templateType = true;
          vm.onPipelineTypeChange();
        }

        if (pluginType && pluginType.length && !vm.pluginType) {
          vm.pluginType = pluginType;
          vm.prefill.pluginType = true;
          vm.getPluginsList(pluginType);
        }

        vm.onPluginSelect();
      }
    });

    vm.cancel = function () {
      PluginTemplatesDirActions.templateClose(true);
    };

    vm.save = function () {
      if (!vm.pluginConfig.pluginTemplate) {
        vm.missingTemplateName = true;
        return;
      }

      var list = vm.pluginList.map(function (p) {
        return p.name;
      });

      if (list.indexOf(vm.pluginConfig.pluginTemplate) !== -1) {
        vm.pluginTemplateNameError = GLOBALS.en.admin.pluginSameNameError;
        return;
      }

      vm.loading = true;
      var outputPropertyName = myHelpers.objectQuery(vm.groupsConfig, 'outputSchema', 'outputSchemaProperty', '0');
      var outputSchema = myHelpers.objectQuery(vm.pluginConfig, 'outputSchema');

      if (outputPropertyName && vm.pluginConfig._backendProperties && vm.pluginConfig._backendProperties[outputPropertyName]) {
        if (Array.isArray(outputSchema)) {
          outputSchema = myHelpers.objectQuery(outputSchema, 0, 'schema');
        }

        vm.pluginConfig.plugin.properties[outputPropertyName] = outputSchema;
      }

      var properties = {
        artifact: vm.plugin.artifact,
        pluginTemplate: vm.pluginConfig.pluginTemplate,
        description: vm.pluginDescription,
        properties: vm.pluginConfig.plugin.properties,
        pluginType: vm.pluginType,
        templateType: vm.templateType,
        pluginName: vm.pluginName,
        outputSchema: outputSchema,
        lock: vm.pluginConfig.lock,
        nodeClass: 'plugin-templates'
      };
      var namespace = $stateParams.namespace;
      mySettings.get('pluginTemplates').then(function (res) {
        if (!angular.isObject(res)) {
          res = {};
        }

        var config = myHelpers.objectQuery(res, namespace, properties.templateType, properties.pluginType, properties.pluginTemplate);

        if (config && !vm.isEdit) {
          vm.pluginTemplateNameError = GLOBALS.en.admin.templateNameExistsError;
          vm.loading = false;
          return;
        }

        if (vm.isEdit && oldTemplateName !== vm.pluginConfig.pluginTemplate) {
          if (config) {
            vm.pluginTemplateNameError = GLOBALS.en.admin.templateNameExistsError;
            vm.loading = false;
            return;
          } else {
            delete res[namespace][properties.templateType][properties.pluginType][oldTemplateName];
          }
        }

        var chain = [namespace, properties.templateType, properties.pluginType, properties.pluginTemplate];
        myHelpers.objectSetter(res, chain, properties);
        mySettings.set('pluginTemplates', res).then(function () {
          vm.loading = false;
          PluginTemplatesDirActions.templateSavedSuccesfully();
        });
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
  /* /plugin-templates.js */

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
  angular.module("".concat(PKG.name, ".commons")).directive('pluginTemplates', function () {
    return {
      restrict: 'EA',
      scope: {},
      templateUrl: 'plugin-templates/plugin-templates.html',
      controller: 'PluginTemplatesCtrl',
      controllerAs: 'PluginTemplatesCtrl'
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
  /* /services/plugin-template-store.js */

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
  var PluginTemplatesDirStore = /*#__PURE__*/function () {
    PluginTemplatesDirStore.$inject = ["PluginTemplatesDirDispatcher"];
    function PluginTemplatesDirStore(PluginTemplatesDirDispatcher) {
      _classCallCheck(this, PluginTemplatesDirStore);

      this.state = {};
      this.setDefaults();
      this.changeListeners = [];
      var dispatcher = PluginTemplatesDirDispatcher.getDispatcher();
      dispatcher.register('onInit', this.initStore.bind(this));
      dispatcher.register('onSaveSuccessfull', this.setIsSaveSuccessfull.bind(this));
      dispatcher.register('onCloseCommand', this.setIsCloseCommand.bind(this));
      dispatcher.register('onReset', this.setDefaults.bind(this));
    }

    _createClass(PluginTemplatesDirStore, [{
      key: "setDefaults",
      value: function setDefaults() {
        this.state = {
          templateType: null,
          pluginType: null,
          pluginName: null,
          mode: null,
          isSaveSuccessful: null
        };
        this.changeListeners = [];
      }
    }, {
      key: "initStore",
      value: function initStore(state) {
        this.state.pluginType = state.pluginType;
        this.state.templateType = state.templateType;
        this.state.templateName = state.templateName;
        this.state.pluginName = state.pluginName;
        this.state.mode = state.mode;
        this.emitChange();
      }
    }, {
      key: "getPluginType",
      value: function getPluginType() {
        return this.state.pluginType;
      }
    }, {
      key: "getTemplateType",
      value: function getTemplateType() {
        return this.state.templateType;
      }
    }, {
      key: "getPluginName",
      value: function getPluginName() {
        return this.state.pluginName;
      }
    }, {
      key: "setPluginName",
      value: function setPluginName(pluginName) {
        this.state.pluginName = pluginName;
      }
    }, {
      key: "getTemplateName",
      value: function getTemplateName() {
        return this.state.templateName;
      }
    }, {
      key: "setTemplateName",
      value: function setTemplateName(pluginName) {
        this.state.templateName = pluginName;
      }
    }, {
      key: "getMode",
      value: function getMode() {
        return this.state.mode;
      }
    }, {
      key: "setMode",
      value: function setMode(mode) {
        this.state.mode = mode;
      }
    }, {
      key: "getIsSaveSuccessfull",
      value: function getIsSaveSuccessfull() {
        return this.state.isSaveSuccessful;
      }
    }, {
      key: "setIsSaveSuccessfull",
      value: function setIsSaveSuccessfull() {
        this.state.isSaveSuccessful = true;
        this.emitChange();
      }
    }, {
      key: "getIsCloseCommand",
      value: function getIsCloseCommand() {
        return this.state.isCloseCommand;
      }
    }, {
      key: "setIsCloseCommand",
      value: function setIsCloseCommand(isCloseCommand) {
        this.state.isCloseCommand = isCloseCommand;
        this.emitChange();
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
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return PluginTemplatesDirStore;
  }();

  PluginTemplatesDirStore.$inject = ['PluginTemplatesDirDispatcher'];
  angular.module("".concat(PKG.name, ".commons")).service('PluginTemplatesDirStore', PluginTemplatesDirStore);
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
  /* /services/plugin-templates-action.js */

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
  var PluginTemplatesDirActions = /*#__PURE__*/function () {
    PluginTemplatesDirActions.$inject = ["PluginTemplatesDirDispatcher"];
    function PluginTemplatesDirActions(PluginTemplatesDirDispatcher) {
      _classCallCheck(this, PluginTemplatesDirActions);

      this.pluginTemplatesDirDispatcher = PluginTemplatesDirDispatcher.getDispatcher();
    }

    _createClass(PluginTemplatesDirActions, [{
      key: "init",
      value: function init(state) {
        this.pluginTemplatesDirDispatcher.dispatch('onInit', state);
      }
    }, {
      key: "reset",
      value: function reset() {
        this.pluginTemplatesDirDispatcher.dispatch('onReset');
      }
    }, {
      key: "triggerSave",
      value: function triggerSave() {
        this.pluginTemplatesDirDispatcher.dispatch('onSaveTriggered');
      }
    }, {
      key: "cancelTriggerSave",
      value: function cancelTriggerSave() {
        this.pluginTemplatesDirDispatcher.dispatch('onSaveTriggerCancel');
      }
    }, {
      key: "templateSavedSuccesfully",
      value: function templateSavedSuccesfully() {
        this.pluginTemplatesDirDispatcher.dispatch('onSaveSuccessfull');
      }
    }, {
      key: "templateClose",
      value: function templateClose(isCloseCommand) {
        this.pluginTemplatesDirDispatcher.dispatch('onCloseCommand', isCloseCommand);
      }
    }, {
      key: "templateSaveFailed",
      value: function templateSaveFailed(err) {
        this.pluginTemplatesDirDispatcher.dispatch('onSaveFailure', err);
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return PluginTemplatesDirActions;
  }();

  PluginTemplatesDirActions.$inject = ['PluginTemplatesDirDispatcher'];
  angular.module("".concat(PKG.name, ".commons")).service('PluginTemplatesDirActions', PluginTemplatesDirActions);
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
  /* /services/plugin-templates-dispatcher.js */

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
  var PluginTemplatesDirDispatcher = /*#__PURE__*/function () {
    PluginTemplatesDirDispatcher.$inject = ["CaskAngularDispatcher"];
    function PluginTemplatesDirDispatcher(CaskAngularDispatcher) {
      _classCallCheck(this, PluginTemplatesDirDispatcher);

      this.__dispatcher__ = null;
      this.baseDispatcher = CaskAngularDispatcher;
    }

    _createClass(PluginTemplatesDirDispatcher, [{
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

    return PluginTemplatesDirDispatcher;
  }();

  PluginTemplatesDirDispatcher.$inject = ['CaskAngularDispatcher'];
  angular.module("".concat(PKG.name, ".commons")).service('PluginTemplatesDirDispatcher', PluginTemplatesDirDispatcher);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-global-navbar.js */

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
  angular.module(PKG.name + '.commons').directive('myGlobalNavbar', function () {
    return {
      restrict: 'E',
      templateUrl: 'my-global-navbar/my-global-navbar.html',
      controller: ["$scope", "$state", "myNamespace", "EventPipe", "myAuth", function controller($scope, $state, myNamespace, EventPipe, myAuth) {
        $scope.params = {
          nativeLink: true
        };
        $scope.$on('$stateChangeSuccess', function () {
          if (!$state.params.namespace) {
            return;
          }

          if (window.CaskCommon && window.CaskCommon.Store) {
            window.CaskCommon.Store.dispatch({
              type: 'SELECT_NAMESPACE',
              payload: {
                selectedNamespace: $state.params.namespace
              }
            });
            updateNamespaceList();
          }
        });

        if (window.CDAP_CONFIG.securityEnabled && myAuth.isAuthenticated()) {
          window.CaskCommon.Store.dispatch({
            type: 'UPDATE_USERNAME',
            payload: {
              username: myAuth.getUsername()
            }
          });
        }

        $scope.namespaces = [];

        function updateNamespaceList() {
          myNamespace.getList(true).then(function (list) {
            $scope.namespaces = list;
            window.CaskCommon.Store.dispatch({
              type: 'UPDATE_NAMESPACES',
              payload: {
                namespaces: $scope.namespaces
              }
            });
          });
        }

        EventPipe.on('namespace.update', updateNamespaceList);
      }]
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
  /* /datetime.js */

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
  DatetimeController.$inject = ["$scope"];
  function DatetimeController($scope) {
    'ngInject';

    var vm = this;
    vm.options = {
      initDate: new Date(),
      showWeeks: false,
      startingDay: 0
    };

    if ($scope.minDate) {
      vm.options.minDate = $scope.minDate;
    }

    if ($scope.maxDate) {
      vm.options.maxDate = $scope.maxDate;
    }

    $scope.dateObject = $scope.dateObject || new Date();

    function init() {
      vm.date = angular.copy($scope.dateObject);
      vm.hour = $scope.dateObject.getHours();
      vm.minutes = $scope.dateObject.getMinutes();
    }

    init();
    $scope.$watch('DatetimeController.hour', function () {
      vm.hour = parseInt(vm.hour, 10);
      formatDate();
    });
    $scope.$watch('DatetimeController.minutes', function () {
      vm.minutes = parseInt(vm.minutes, 10);
      formatDate();
    });
    $scope.$watch('DatetimeController.date', formatDate);

    function formatDate() {
      var year = vm.date.getFullYear(),
          month = vm.date.getMonth(),
          day = vm.date.getDate(),
          hour = vm.hour,
          minutes = vm.minutes;
      $scope.dateObject = !hour && hour !== 0 || !minutes && minutes !== 0 ? null : new Date(year, month, day, hour, minutes, 0);
    }
  }

  angular.module(PKG.name + '.commons').directive('myDatetimePicker', function () {
    return {
      restrict: 'E',
      scope: {
        dateObject: '=',
        minDate: '=?',
        maxDate: '=?'
      },
      controller: DatetimeController,
      controllerAs: 'DatetimeController',
      templateUrl: 'datetime-picker/datetime.html'
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
  /* /datetime-range.js */

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
  RangeController.$inject = ["$scope"];
  function RangeController($scope) {
    'ngInject';

    var vm = this;
    vm.startTimeOpen = false;
    vm.endTimeOpen = false;

    vm.openStartTime = function () {
      vm.startTimeOpen = true;
      vm.endTimeOpen = false;
    };

    vm.openEndTime = function () {
      vm.startTimeOpen = false;
      vm.endTimeOpen = true;
    };

    vm.done = function () {
      vm.close();
      $scope.onDone();
    };

    vm.close = function () {
      vm.startTimeOpen = false;
      vm.endTimeOpen = false;
    };

    var keydownListener = function keydownListener(event) {
      if (event.keyCode !== 27) {
        return;
      }

      vm.close();
    };

    document.addEventListener('keydown', keydownListener);
    document.body.addEventListener('click', vm.close, false);
    $scope.$on('$destroy', function () {
      document.removeEventListener('keydown', keydownListener);
      document.body.removeEventListener('click', vm.close, false);
    });
  }

  angular.module(PKG.name + '.commons').directive('myDatetimeRange', function () {
    return {
      restrict: 'E',
      scope: {
        dateRange: '=',
        onDone: '&'
      },
      controller: RangeController,
      controllerAs: 'RangeController',
      templateUrl: 'datetime-range/datetime-range.html'
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
  /* /complex-schema-helpers.js */

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
  angular.module(PKG.name + '.commons').constant('SCHEMA_TYPES', {
    'types': ['boolean', 'bytes', 'date', 'double', 'decimal', 'float', 'int', 'long', 'string', 'time', 'timestamp', 'array', 'enum', 'map', 'union', 'record'],
    'simpleTypes': ['decimal', 'boolean', 'bytes', 'date', 'double', 'float', 'int', 'long', 'string', 'time', 'timestamp']
  }).factory('SchemaHelper', ["avsc", function (avsc) {
    function parseType(type) {
      var storedType = type;
      var nullable = false;

      if (type.getTypeName() === 'union:wrapped') {
        type = type.getTypes();

        if (type[1] && type[1].getTypeName() === 'null') {
          storedType = type[0];
          type = type[0].getTypeName();
          nullable = true;
        } else {
          type = 'union';
        }
      } else {
        type = type.getTypeName();
      }

      type = avsc.getDisplayType(type);
      return {
        displayType: type,
        type: storedType,
        nullable: nullable,
        nested: checkComplexType(type)
      };
    }

    function checkComplexType(displayType) {
      var complexTypes = ['array', 'enum', 'map', 'record', 'union'];
      return complexTypes.indexOf(displayType) !== -1 ? true : false;
    }

    return {
      parseType: parseType,
      checkComplexType: checkComplexType
    };
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /complex-schema.js */

  /*
   * Copyright © 2016-2020 Cask Data, Inc.
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
  ComplexSchemaController.$inject = ["avsc", "SCHEMA_TYPES", "$scope", "uuid", "$timeout", "SchemaHelper"];
  function ComplexSchemaController(avsc, SCHEMA_TYPES, $scope, uuid, $timeout, SchemaHelper) {
    'ngInject';

    var vm = this;
    vm.SCHEMA_TYPES = SCHEMA_TYPES.types;
    vm.parsedSchema = [];
    var recordName;
    var timeout;
    var addFieldTimeout;
    vm.emptySchema = false; // lazy loading parameters

    $scope.id = uuid.v4();
    $scope.lazyLoadedParsedSchema = [];
    vm.windowSize = 50;
    vm.DEFAULT_WINDOW_SIZE = 50;
    vm.lazyloading = false;
    $scope.$watch('domLoaded', function () {
      /*
        Wait for the dom to be loaded
        Equivalent of componentDidMount :sigh:
      */
      if (!$scope.domLoaded) {
        return;
      }
      /*
        For some reason if the dom is loaded but none of the fields are
        rendered we don't need to do anything.
      */


      var fields = document.querySelectorAll("#schema-container-".concat($scope.id, " .field-row"));

      if (!fields.length) {
        return;
      }
      /* jshint ignore:start */


      vm.io = new IntersectionObserver(function (entries) {
        var lastVisibleElement = vm.windowSize;

        var _iterator = _createForOfIteratorHelper(entries),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;
            var id = entry.target.getAttribute('lazyload-id');
            var numID = parseInt(id, 10);

            if (entry.isIntersecting) {
              lastVisibleElement = numID + vm.DEFAULT_WINDOW_SIZE > vm.windowSize ? numID + vm.DEFAULT_WINDOW_SIZE : numID;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (lastVisibleElement > vm.windowSize) {
          vm.windowSize = lastVisibleElement;
          vm.lazyloading = true;
          /*
            The timeout is to sort-of give a smooth transition
            scroll => loading ... => then after a second show the fields
            This is the best effort to avoid jankiness while scrolling
          */

          $timeout(function () {
            // This is to trigger a re-render for angular.
            $scope.$apply(function () {
              $scope.lazyLoadedParsedSchema = $scope.lazyLoadedParsedSchema.concat(vm.parsedSchema.slice($scope.lazyLoadedParsedSchema.length, lastVisibleElement));
              vm.lazyloading = false;
            });
          }, 1000);
        }
      }, {
        // We don't have a root. Browser fallsback to document
        threshold: [0, 1]
      });
      /* jshint ignore:end */

      $scope.observeFields();
    });

    $scope.observeFields = function () {
      if (!vm.io) {
        return;
      }

      document.querySelectorAll("#schema-container-".concat($scope.id, " .field-row")).forEach(function (entry) {
        vm.io.observe(entry);
      });
    };

    vm.addField = function (index) {
      var placement = index === undefined ? 0 : index + 1;
      var newField = {
        name: '',
        type: 'string',
        displayType: 'string',
        nullable: false,
        id: uuid.v4(),
        nested: false,
        collapse: false
      };
      vm.parsedSchema.splice(placement, 0, newField);
      $scope.lazyLoadedParsedSchema.splice(placement, 0, newField);
      vm.formatOutput();

      if (index !== undefined) {
        $timeout.cancel(addFieldTimeout);
        addFieldTimeout = $timeout(function () {
          var elem = document.getElementById(newField.id);
          angular.element(elem)[0].focus();
        });
      }
    };

    vm.removeField = function (index) {
      vm.parsedSchema.splice(index, 1);

      if (vm.parsedSchema.length === 0) {
        vm.addField();
      }

      $scope.lazyLoadedParsedSchema = vm.parsedSchema.slice(0, vm.windowSize);
      vm.formatOutput();
    };

    vm.changeType = function (field) {
      if (SCHEMA_TYPES.simpleTypes.indexOf(field.displayType) !== -1) {
        field.type = field.displayType;
        vm.formatOutput();
      } else {
        field.collapse = false;
        field.type = null;
      }

      field.nested = SchemaHelper.checkComplexType(field.displayType);
    };

    vm.pasteFields = function (event, index) {
      event.preventDefault();
      var data = [];
      var pastedData = event.clipboardData.getData('text/plain');
      var pastedDataArr = pastedData.replace(/[\n\r\t,| ]/g, '$').split('$');
      pastedDataArr.filter(function (name) {
        if (name) {
          data.push({
            'name': name,
            'type': 'string',
            displayType: 'string',
            nullable: false,
            id: uuid.v4(),
            nested: false
          });
        }
      });
      document.getElementsByClassName('bottompanel-body')[0].scrollTop = 0; // This happens when the user adds a new field, then paste the data.
      // In that case we should delete the empty before pasting.

      if (!vm.parsedSchema[index].name) {
        vm.parsedSchema.splice(index, 1);
      }

      vm.parsedSchema = vm.parsedSchema.concat(data);
      $scope.lazyLoadedParsedSchema = vm.parsedSchema.slice(0, vm.windowSize);
      vm.formatOutput();
    };

    function init(strJson) {
      var isEmptySchema = function isEmptySchema(schemaJson) {
        if (!schemaJson) {
          return true;
        } // we need to check if schemaJson has fields or is already returned by avsc parser in which case the fields will be
        // accessed using getFields() function.


        if (angular.isObject(schemaJson) && !(schemaJson.fields || schemaJson.getFields && schemaJson.getFields() || []).length) {
          return true;
        }

        return false;
      };

      if ((!strJson || strJson === 'record') && !vm.isDisabled) {
        vm.addField();
        var recordNameWithIndex;

        if (vm.isRecordSchema && vm.typeIndex) {
          recordNameWithIndex = 'record' + vm.typeIndex;
        }

        recordName = vm.recordName || recordNameWithIndex || 'a' + uuid.v4().split('-').join('');
        vm.formatOutput();
        return;
      }

      if (isEmptySchema(strJson) && vm.isDisabled) {
        vm.emptySchema = true;
        return;
      } // TODO(CDAP-13010): for splitters, the backend returns port names similar to [schemaName].string or [schemaName].int.
      // However, some weird parsing code in the avsc library doesn't allow primitive type names to be after periods(.),
      // so we have to manually make this change here. Ideally the backend should provide a different syntax for port
      // names so that we don't have to do this hack in the UI.


      if (strJson.name) {
        strJson.name = strJson.name.replace('.', '.type');
      }

      var parsed = avsc.parse(strJson, {
        wrapUnions: true
      });
      recordName = vm.recordName || parsed._name;
      vm.parsedSchema = parsed.getFields().map(function (field) {
        var type = field.getType();
        var partialObj = SchemaHelper.parseType(type);
        return Object.assign({}, partialObj, {
          id: uuid.v4(),
          name: field.getName(),
          collapse: true
        });
      });

      if (!vm.isDisabled && vm.parsedSchema.length === 0) {
        vm.addField();
        return;
      }

      $scope.lazyLoadedParsedSchema = vm.parsedSchema.slice(0, vm.windowSize);
      vm.formatOutput(true);
    } // In some cases, we edit the schema when the user opens a node, so the schema changes without the
    // user doing anything. In those cases we should update the 'default' schema state to the state after
    // we've done our initialzing i.e. updateDefault = true. Defaults to false.


    vm.formatOutput = function () {
      var updateDefault = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      vm.error = '';
      var outputFields = vm.parsedSchema.filter(function (field) {
        return field.name && field.type ? true : false;
      }).map(function (field) {
        var type = avsc.formatType(field.type);
        var obj = {
          name: field.name,
          type: field.nullable ? [type, 'null'] : type
        };
        return obj;
      });

      if (outputFields.length > 0) {
        var obj = {
          type: 'record',
          name: recordName || 'a' + uuid.v4().split('-').join(''),
          fields: outputFields
        }; // Validate

        try {
          avsc.parse(obj, {
            wrapUnions: true
          });
        } catch (e) {
          var err = '' + e;
          err = err.split(':');
          vm.error = err[0] + ': ' + err[1];
          return;
        }

        if (!vm.error) {
          vm.model = obj;
        }
      } else {
        vm.model = '';
      }

      if (typeof vm.parentFormatOutput === 'function') {
        timeout = $timeout(vm.parentFormatOutput.bind(null, {
          updateDefault: updateDefault
        }));
      }
    };

    if (vm.derivedDatasetId) {
      vm.disabledTooltip = "The dataset '".concat(vm.derivedDatasetId, "' already exists. Its schema cannot be modified.");
    }

    if (vm.isInputSchema) {
      vm.disabledTooltip = "This input schema has been derived from the output schema of the previous node(s) and cannot be changed.";
    }

    init(vm.model);
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
      $timeout.cancel(addFieldTimeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('myComplexSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/complex-schema.html',
      controller: ComplexSchemaController,
      controllerAs: 'ComplexSchema',
      bindToController: true,
      scope: {
        model: '=ngModel',
        recordName: '=',
        isRecordSchema: '=',
        typeIndex: '=',
        parentFormatOutput: '&',
        isDisabled: '=',
        schemaPrefix: '=',
        derivedDatasetId: '=',
        isInputSchema: '=',
        isInStudio: '=',
        errors: '='
      },
      link: function link(scope, element) {
        scope.domLoaded = false;
        /*
          This watch is here because when we update the lazyLoadedParsedSchema we need to
          observe the newly added fields. There is no way to check if new fields are
          added to the DOM unless we watch it.
          This cannot be done as soon as we update lazyLoadedParsedSchema in the controller
          because angular doesn't guarantee that the DOM node will be available immediately
          after we add new fields to the array.
        */

        scope.$watch(function () {
          return document.querySelectorAll("#schema-container-".concat(scope.id, " .field-row")).length;
        }, function (newValue, oldValue) {
          if (newValue !== oldValue) {
            scope.observeFields();
          }
        });
        element.ready(function () {
          scope.$apply(function () {
            scope.domLoaded = true;
          });
        });
      }
    };
  }).directive('myRecordSchema', ["$compile", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=ngModel',
        recordName: '=',
        typeIndex: '=',
        parentFormatOutput: '&',
        isDisabled: '=',
        schemaPrefix: '='
      },
      link: function link(scope, element) {
        var elemString = "<my-complex-schema\n                          ng-model=\"model\"\n                          record-name=\"recordName\"\n                          type-index=\"typeIndex\"\n                          is-record-schema=\"true\"\n                          parent-format-output=\"parentFormatOutput()\"\n                          is-disabled=\"isDisabled\"\n                          schema-prefix=\"schemaPrefix\">\n                        </my-complex-schema>";
        $compile(elemString)(scope, function (cloned) {
          element.append(cloned);
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
  /* /array-schema/array-schema.js */

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
  ArraySchemaController.$inject = ["avsc", "SCHEMA_TYPES", "$timeout", "$scope", "SchemaHelper"];
  function ArraySchemaController(avsc, SCHEMA_TYPES, $timeout, $scope, SchemaHelper) {
    'ngInject';

    var vm = this;
    vm.SCHEMA_TYPES = SCHEMA_TYPES.types;
    vm.items = {};
    var timeout;

    vm.changeType = function () {
      if (SCHEMA_TYPES.simpleTypes.indexOf(vm.items.displayType) !== -1) {
        vm.items.type = vm.items.displayType;
        vm.formatOutput();
      } else {
        vm.items.type = null;
      }

      vm.items.nested = SchemaHelper.checkComplexType(vm.items.displayType);
    };

    vm.formatOutput = function () {
      vm.error = '';
      var type = avsc.formatType(vm.items.type);
      var obj = {
        type: 'array',
        items: vm.items.nullable ? [type, 'null'] : type
      }; // Validate

      try {
        avsc.parse(obj, {
          wrapUnions: true
        });
      } catch (e) {
        var err = '' + e;
        err = err.split(':');
        vm.error = err[0] + ': ' + err[1];
        return;
      }

      vm.model = obj;

      if (typeof vm.parentFormatOutput === 'function') {
        timeout = $timeout(vm.parentFormatOutput);
      }
    };

    function init(strJson) {
      if (!strJson || strJson === 'array') {
        vm.items = {
          displayType: 'string',
          type: 'string',
          nullable: false,
          nested: false
        };
        vm.formatOutput();
        return;
      }

      var parsed = avsc.parse(strJson, {
        wrapUnions: true
      });
      var type = parsed.getItemsType();
      vm.items = SchemaHelper.parseType(type);
      vm.formatOutput();
    }

    init(vm.model);
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('myArraySchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/array-schema/array-schema.html',
      controller: ArraySchemaController,
      controllerAs: 'ArraySchema',
      bindToController: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      }
    };
  }).directive('myArraySchemaWrapper', ["$compile", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      },
      link: function link(scope, element) {
        var elemString = "<my-array-schema\n                          ng-model=\"model\"\n                          parent-format-output=\"parentFormatOutput()\"\n                          is-disabled=\"isDisabled\">\n                        </my-array-schema>";
        $compile(elemString)(scope, function (cloned) {
          element.append(cloned);
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
  /* /embedded-schema-selector/embedded-schema-selector.js */

  /*
   * Copyright © 2016-2020 Cask Data, Inc.
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
  angular.module(PKG.name + '.commons').directive('myEmbeddedSchemaSelector', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/embedded-schema-selector/embedded-schema-selector.html',
      scope: {
        type: '=',
        displayType: '=',
        index: '=',
        parentFormatOutput: '&',
        isDisabled: '=',
        collapse: '='
      },
      bindToController: true,
      controller: ["SchemaHelper", function controller(SchemaHelper) {
        var vm = this;
        vm.checkComplexType = SchemaHelper.checkComplexType;
        vm.expanded = !vm.collapse;
      }],
      controllerAs: 'Embedded'
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
  /* /enum-schema/enum-schema.js */

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
  EnumSchemaController.$inject = ["avsc", "$timeout", "$scope", "uuid"];
  function EnumSchemaController(avsc, $timeout, $scope, uuid) {
    'ngInject';

    var vm = this;
    vm.symbols = [];
    var timeout;
    var addSymbolTimeout;

    vm.addSymbol = function (index) {
      var placement = index === undefined ? 0 : index + 1;
      var newSymbol = {
        name: '',
        id: uuid.v4()
      };
      vm.symbols.splice(placement, 0, newSymbol);
      $timeout.cancel(addSymbolTimeout);
      addSymbolTimeout = $timeout(function () {
        var elem = document.getElementById(newSymbol.id);
        angular.element(elem)[0].focus();
      });
    };

    vm.removeSymbol = function (index) {
      vm.symbols.splice(index, 1);

      if (vm.symbols.length === 0) {
        vm.addSymbol();
      }

      vm.formatOutput();
    };

    vm.formatOutput = function () {
      vm.error = '';
      var symbols = vm.symbols.filter(function (symbol) {
        return symbol.name ? true : false;
      }).map(function (symbol) {
        return symbol.name;
      });

      if (symbols.length === 0) {
        vm.model = '';
        return;
      }

      var obj = {
        type: 'enum',
        symbols: symbols
      }; // Validate

      try {
        avsc.parse(obj, {
          wrapUnions: true
        });
      } catch (e) {
        vm.error = '' + e;
        return;
      }

      vm.model = obj;

      if (typeof vm.parentFormatOutput === 'function') {
        timeout = $timeout(vm.parentFormatOutput);
      }
    };

    init(vm.model);

    function init(strJson) {
      if (!strJson || strJson === 'enum') {
        vm.addSymbol();
        vm.formatOutput();
        return;
      }

      var parsed = avsc.parse(strJson, {
        wrapUnions: true
      });
      vm.symbols = parsed.getSymbols().map(function (symbol) {
        return {
          name: symbol,
          id: uuid.v4()
        };
      });
      vm.formatOutput();
    }

    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
      $timeout.cancel(addSymbolTimeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('myEnumSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/enum-schema/enum-schema.html',
      controller: EnumSchemaController,
      controllerAs: 'EnumSchema',
      bindToController: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      }
    };
  }).directive('myEnumSchemaWrapper', ["$compile", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      },
      link: function link(scope, element) {
        var elemString = "<my-enum-schema\n                          ng-model=\"model\"\n                          parent-format-output=\"parentFormatOutput()\"\n                          is-disabled=\"isDisabled\">\n                        </my-enum-schema>";
        $compile(elemString)(scope, function (cloned) {
          element.append(cloned);
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
  /* /map-schema/map-schema.js */

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
  MapSchemaController.$inject = ["avsc", "SCHEMA_TYPES", "SchemaHelper", "$scope", "$timeout"];
  function MapSchemaController(avsc, SCHEMA_TYPES, SchemaHelper, $scope, $timeout) {
    'ngInject';

    var vm = this;
    var timeout;
    vm.SCHEMA_TYPES = SCHEMA_TYPES.types;
    vm.fields = {
      keys: null,
      values: null
    };

    vm.changeType = function (field) {
      if (SCHEMA_TYPES.simpleTypes.indexOf(field.displayType) !== -1) {
        field.type = field.displayType;
        vm.formatOutput();
      } else {
        field.type = null;
      }

      field.nested = SchemaHelper.checkComplexType(field.displayType);
    };

    function init(strJson) {
      if (!strJson || strJson === 'map') {
        vm.fields.keys = {
          type: 'string',
          displayType: 'string',
          nullable: false,
          nested: false
        };
        vm.fields.values = {
          type: 'string',
          displayType: 'string',
          nullable: false,
          nested: false
        };
        vm.formatOutput();
        return;
      }

      var parsed = avsc.parse(strJson, {
        wrapUnions: true
      });
      vm.fields.keys = SchemaHelper.parseType(parsed.getKeysType());
      vm.fields.values = SchemaHelper.parseType(parsed.getValuesType());
      vm.formatOutput();
    }

    vm.formatOutput = function () {
      vm.error = '';
      var keysType = avsc.formatType(vm.fields.keys.type);
      var valuesType = avsc.formatType(vm.fields.values.type);
      var obj = {
        type: 'map',
        keys: vm.fields.keys.nullable ? [keysType, 'null'] : keysType,
        values: vm.fields.values.nullable ? [valuesType, 'null'] : valuesType
      }; // Validate

      try {
        avsc.parse(obj, {
          wrapUnions: true
        });
      } catch (e) {
        var err = '' + e;
        err = err.split(':');
        vm.error = err[0] + ': ' + err[1];
        return;
      }

      vm.model = obj;

      if (typeof vm.parentFormatOutput === 'function') {
        timeout = $timeout(vm.parentFormatOutput);
      }
    };

    init(vm.model);
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('myMapSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/map-schema/map-schema.html',
      controller: MapSchemaController,
      controllerAs: 'MapSchema',
      bindToController: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      }
    };
  }).directive('myMapSchemaWrapper', ["$compile", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      },
      link: function link(scope, element) {
        var elemString = "<my-map-schema\n                          ng-model=\"model\"\n                          parent-format-output=\"parentFormatOutput()\"\n                          is-disabled=\"isDisabled\">\n                        </my-map-schema>";
        $compile(elemString)(scope, function (cloned) {
          element.append(cloned);
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
  /* /union-schema/union-schema.js */

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
  UnionSchemaController.$inject = ["avsc", "SCHEMA_TYPES", "SchemaHelper", "$scope", "$timeout"];
  function UnionSchemaController(avsc, SCHEMA_TYPES, SchemaHelper, $scope, $timeout) {
    'ngInject';

    var vm = this;
    vm.SCHEMA_TYPES = SCHEMA_TYPES.types;
    var timeout;
    vm.types = [];
    var recordCount = 0;

    vm.addType = function (index) {
      var placement = index === undefined ? 0 : index + 1;
      vm.types.splice(placement, 0, {
        type: 'string',
        displayType: 'string',
        nullable: false,
        nested: false
      });
      vm.formatOutput();
    };

    vm.removeType = function (index) {
      var type = vm.types[index];

      if (type.displayType === 'record') {
        recordCount--;
      }

      vm.types.splice(index, 1);

      if (vm.types.length === 0) {
        vm.addType();
      }

      vm.formatOutput();
    };

    vm.changeType = function (item, oldDisplayType) {
      if (SCHEMA_TYPES.simpleTypes.indexOf(item.displayType) !== -1) {
        item.type = item.displayType;
        vm.formatOutput();
      } else {
        item.type = null;

        if (item.displayType === 'record') {
          recordCount++;
          item.index = recordCount;
        }
      }

      if (oldDisplayType === 'record') {
        recordCount--;
        item.index = null;
      }

      item.nested = SchemaHelper.checkComplexType(item.displayType);
    };

    function init(strJson) {
      if (!strJson || strJson === 'union') {
        vm.addType();
        vm.formatOutput();
        return;
      }

      var parsed = avsc.parse(strJson, {
        wrapUnions: true
      });
      vm.types = parsed.getTypes().map(SchemaHelper.parseType);
      angular.forEach(vm.types, function (type) {
        if (type.displayType === 'record') {
          recordCount++;
        }
      });
      vm.formatOutput();
    }

    vm.formatOutput = function () {
      vm.error = '';
      var outputArr = vm.types.map(function (item) {
        var type = avsc.formatType(item.type);
        return item.nullable ? [type, 'null'] : type;
      });

      if (outputArr.length === 0) {
        vm.model = '';
        return;
      } // Validate


      try {
        avsc.parse(outputArr, {
          wrapUnions: true
        });
      } catch (e) {
        var err = '' + e;
        err = err.split(':');
        vm.error = err[0] + ': ' + err[1];
        return;
      }

      vm.model = outputArr;

      if (typeof vm.parentFormatOutput === 'function') {
        timeout = $timeout(vm.parentFormatOutput);
      }
    };

    init(vm.model);
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
    });
  }

  angular.module(PKG.name + '.commons').directive('myUnionSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'complex-schema/union-schema/union-schema.html',
      controller: UnionSchemaController,
      controllerAs: 'UnionSchema',
      bindToController: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      }
    };
  }).directive('myUnionSchemaWrapper', ["$compile", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=ngModel',
        parentFormatOutput: '&',
        isDisabled: '='
      },
      link: function link(scope, element) {
        var elemString = "<my-union-schema\n                          ng-model=\"model\"\n                          parent-format-output=\"parentFormatOutput()\"\n                          is-disabled=\"isDisabled\">\n                        </my-union-schema>";
        $compile(elemString)(scope, function (cloned) {
          element.append(cloned);
        });
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
  /* /my-pipeline-summary-ctrl.js */

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
  var MyPipelineSummaryCtrl = /*#__PURE__*/function () {
    MyPipelineSummaryCtrl.$inject = ["$scope", "moment", "$interval", "GLOBALS", "$stateParams"];
    function MyPipelineSummaryCtrl($scope, moment, $interval, GLOBALS, $stateParams) {
      _classCallCheck(this, MyPipelineSummaryCtrl);

      this.$stateParams = $stateParams;
      this.runs = [];
      this.programId = '';
      this.programType = '';
      this.appId = '';
      this.moment = moment;
      this.setState();
      this.store.registerOnChangeListener(this.setState.bind(this));
    }

    _createClass(MyPipelineSummaryCtrl, [{
      key: "setState",
      value: function setState() {
        this.totalRunsCount = this.store.getRunsCount();
        this.runs = this.store.getRuns();
        var params = this.store.getParams();
        this.programType = params.programType.toUpperCase();
        this.programId = params.programName;
        this.appId = params.app;
        this.namespaceId = this.$stateParams.namespace;
        var averageRunTime = this.store.getStatistics().avgRunTime; // We get time as seconds from backend. So multiplying it by 1000 to give moment.js in milliseconds.

        if (averageRunTime) {
          this.avgRunTime = this.moment.utc(averageRunTime * 1000).format('HH:mm:ss');
        } else {
          this.avgRunTime = 'N/A';
        }

        var nextRunTime = this.store.getNextRunTime();

        if (nextRunTime && nextRunTime.length) {
          this.nextRunTime = nextRunTime[0].time ? nextRunTime[0].time : null;
        } else {
          this.nextRunTime = 'N/A';
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

    return MyPipelineSummaryCtrl;
  }();

  MyPipelineSummaryCtrl.$inject = ['$scope', 'moment', '$interval', 'GLOBALS', '$stateParams'];
  angular.module(PKG.name + '.commons').controller('MyPipelineSummaryCtrl', MyPipelineSummaryCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-summary.js */

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
  angular.module(PKG.name + '.commons').directive('myPipelineSummary', function () {
    return {
      restrict: 'A',
      scope: {
        store: '=',
        pipelineConfig: '=',
        actionCreator: '=',
        pipelineType: '@',
        onClose: '&'
      },
      replace: false,
      templateUrl: 'my-pipeline-summary/my-pipeline-summary.html',
      controller: 'MyPipelineSummaryCtrl',
      controllerAs: 'MyPipelineSummaryCtrl',
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
  /* /my-pipeline-client-resource-ctrl.js */

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
  MyPipelineClientResourceCtrl.$inject = ["$scope", "HYDRATOR_DEFAULT_VALUES"];
  function MyPipelineClientResourceCtrl($scope, HYDRATOR_DEFAULT_VALUES) {
    'ngInject';

    $scope.virtualCores = $scope.virtualCoresValue || $scope.store.getClientVirtualCores();
    $scope.memoryMB = $scope.memoryMbValue || $scope.store.getClientMemoryMB();
    $scope.cores = Array.apply(null, {
      length: 20
    }).map(function (ele, index) {
      return index + 1;
    });
    $scope.numberConfig = {
      'widget-attributes': {
        min: 0,
        "default": HYDRATOR_DEFAULT_VALUES.resources.memoryMB,
        showErrorMessage: false,
        convertToInteger: true
      }
    };
    $scope.$watch('memoryMB', function (oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }

      if ($scope.onMemoryChange && typeof $scope.onMemoryChange === 'function') {
        var fn = $scope.onMemoryChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.memoryMB);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setClientMemoryMB($scope.memoryMB);
        }
      }
    });

    $scope.onVirtualCoresChange = function () {
      if ($scope.onCoreChange && typeof $scope.onCoreChange === 'function') {
        var fn = $scope.onCoreChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.virtualCores);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setClientVirtualCores($scope.virtualCores);
        }
      }
    };
  }

  angular.module(PKG.name + '.commons').controller('MyPipelineClientResourceCtrl', MyPipelineClientResourceCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-driver-resource-ctrl.js */

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
  MyPipelineDriverResourceCtrl.$inject = ["$scope", "HYDRATOR_DEFAULT_VALUES"];
  function MyPipelineDriverResourceCtrl($scope, HYDRATOR_DEFAULT_VALUES) {
    'ngInject';

    $scope.virtualCores = $scope.virtualCoresValue || $scope.store.getDriverVirtualCores();
    $scope.memoryMB = $scope.memoryMbValue || $scope.store.getDriverMemoryMB();
    $scope.cores = Array.apply(null, {
      length: 20
    }).map(function (ele, index) {
      return index + 1;
    });
    $scope.numberConfig = {
      'widget-attributes': {
        min: 0,
        "default": HYDRATOR_DEFAULT_VALUES.resources.memoryMB,
        showErrorMessage: false,
        convertToInteger: true
      }
    };
    $scope.$watch('memoryMB', function (oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }

      if ($scope.onMemoryChange && typeof $scope.onMemoryChange === 'function') {
        var fn = $scope.onMemoryChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.memoryMB);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setDriverMemoryMB($scope.memoryMB);
        }
      }
    });

    $scope.onVirtualCoresChange = function () {
      if ($scope.onCoreChange && typeof $scope.onCoreChange === 'function') {
        var fn = $scope.onCoreChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.virtualCores);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setDriverVirtualCores($scope.virtualCores);
        }
      }
    };
  }

  angular.module(PKG.name + '.commons').controller('MyPipelineDriverResourceCtrl', MyPipelineDriverResourceCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-executor-resource-ctrl.js */

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
  MyPipelineExecutorResourceCtrl.$inject = ["$scope", "HYDRATOR_DEFAULT_VALUES"];
  function MyPipelineExecutorResourceCtrl($scope, HYDRATOR_DEFAULT_VALUES) {
    'ngInject';

    $scope.virtualCores = $scope.virtualCoresValue || $scope.store.getVirtualCores();
    $scope.memoryMB = $scope.memoryMbValue || $scope.store.getMemoryMB();
    $scope.cores = Array.apply(null, {
      length: 20
    }).map(function (ele, index) {
      return index + 1;
    });
    $scope.numberConfig = {
      'widget-attributes': {
        min: 0,
        "default": HYDRATOR_DEFAULT_VALUES.resources.memoryMB,
        showErrorMessage: false,
        convertToInteger: true
      }
    };
    $scope.$watch('memoryMB', function (oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }

      if ($scope.onMemoryChange && typeof $scope.onMemoryChange === 'function') {
        var fn = $scope.onMemoryChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.memoryMB);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setMemoryMB($scope.memoryMB);
        }
      }
    });

    $scope.onVirtualCoresChange = function () {
      if ($scope.onCoreChange && typeof $scope.onCoreChange === 'function') {
        var fn = $scope.onCoreChange();

        if ('undefined' !== typeof fn) {
          fn.call()($scope.virtualCores);
        }
      } else {
        if (!$scope.isDisabled) {
          $scope.actionCreator.setVirtualCores($scope.virtualCores);
        }
      }
    };
  }

  angular.module(PKG.name + '.commons').controller('MyPipelineExecutorResourceCtrl', MyPipelineExecutorResourceCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /my-pipeline-resource-factory.js */

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
  angular.module(PKG.name + '.commons').factory('MyPipelineResourceFactory', function () {
    var attributes = {
      'store': 'store',
      'action-creator': 'actionCreator',
      'is-disabled': 'isDisabled',
      'on-memory-change': 'onMemoryChange',
      'on-core-change': 'onCoreChange',
      'memory-mb-value': 'memoryMbValue',
      'virtual-cores-value': 'virtualCoresValue'
    };
    return {
      'driverResource': {
        'element': '<my-pipeline-driver-resource></my-pipeline-driver-resource>',
        'attributes': attributes
      },
      'clientResource': {
        'element': '<my-pipeline-client-resource></my-pipeline-client-resource>',
        'attributes': attributes
      },
      'executorResource': {
        'element': '<my-pipeline-executor-resource></my-pipeline-executor-resource>',
        'attributes': attributes
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
  /* /my-pipeline-resource.js */

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
  angular.module(PKG.name + '.commons').directive('myPipelineResourceFactory', ["MyPipelineResourceFactory", "$compile", function (MyPipelineResourceFactory, $compile) {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        store: '=',
        actionCreator: '=',
        isDisabled: '=',
        resourceType: '@',
        onMemoryChange: '&',
        onCoreChange: '&',
        memoryMbValue: '=',
        virtualCoresValue: '='
      },
      link: function link(scope, element) {
        var angularElement, widget, divElement;
        element.removeAttr('my-pipeline-resource-factory');
        widget = MyPipelineResourceFactory[scope.resourceType];

        if (!widget) {
          return;
        }

        divElement = angular.element('<div></div>');
        angularElement = angular.element(widget.element);
        angular.forEach(widget.attributes, function (value, key) {
          angularElement.attr(key, value);
        });
        divElement.append(angularElement);
        var content = $compile(divElement)(scope);
        element.append(content);
      }
    };
  }]).directive('myPipelineDriverResource', function () {
    return {
      restrict: 'E',
      scope: {
        actionCreator: '=',
        store: '=',
        isDisabled: '=',
        onMemoryChange: '&',
        onCoreChange: '&',
        memoryMbValue: '=',
        virtualCoresValue: '='
      },
      templateUrl: 'my-pipeline-resource/my-pipeline-resource.html',
      controller: 'MyPipelineDriverResourceCtrl'
    };
  }).directive('myPipelineExecutorResource', function () {
    return {
      restrict: 'E',
      scope: {
        actionCreator: '=',
        store: '=',
        isDisabled: '=',
        onMemoryChange: '&',
        onCoreChange: '&',
        memoryMbValue: '=',
        virtualCoresValue: '='
      },
      templateUrl: 'my-pipeline-resource/my-pipeline-resource.html',
      controller: 'MyPipelineExecutorResourceCtrl'
    };
  }).directive('myPipelineClientResource', function () {
    return {
      restrict: 'E',
      scope: {
        actionCreator: '=',
        store: '=',
        isDisabled: '=',
        onMemoryChange: '&',
        onCoreChange: '&',
        memoryMbValue: '=',
        virtualCoresValue: '='
      },
      templateUrl: 'my-pipeline-resource/my-pipeline-resource.html',
      controller: 'MyPipelineClientResourceCtrl'
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
  /* /my-post-run-action-wizard-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('MyPostRunActionWizardCtrl', ["$scope", "uuid", function ($scope, uuid) {
    'ngInject';

    var vm = this;
    vm.action = vm.action || {};

    if (vm.action && Object.keys(vm.action).length > 1) {
      vm.selectedAction = Object.assign({}, angular.copy(vm.action.plugin), {
        defaultArtifact: vm.action.plugin.artifact,
        id: vm.action.id,
        description: vm.action.description
      });
    } else {
      vm.selectedAction = {};
    }

    if (vm.mode === 'edit') {
      vm.currentStage = 2;
    } else if (vm.mode === 'view') {
      vm.currentStage = 3;
      vm.configuredAction = vm.selectedAction;
    } else if (vm.mode === 'create') {
      vm.currentStage = 1;
    }

    vm.goToPreviousStep = function () {
      vm.currentStage -= 1;

      if (vm.currentStage === 1) {
        vm.selectedAction = {};
        $scope.$parent.action = vm.selectedAction;
      }
    };

    vm.onActionSelect = function (action) {
      vm.selectedAction = action;
      $scope.$parent.action = vm.selectedAction;
      vm.currentStage = 2;
    };

    vm.onActionConfigure = function (action, actionCallback) {
      var fn = vm.validate();

      var callback = function callback(errors) {
        if (typeof actionCallback === 'function') {
          actionCallback();
        }

        if (errors && Object.keys(errors).length) {
          return;
        }

        vm.configuredAction = action;
        $scope.$parent.action = vm.configuredAction;
        vm.currentStage += 1;
      };

      if ('undefined' !== typeof fn) {
        fn.call(null, action, callback, true);
      }
    };

    vm.onActionConfirm = function (action) {
      if (!action) {
        $scope.$parent.$close();
        return;
      }

      vm.confirmedAction = {
        name: vm.action.name || action.name,
        id: vm.action.id || action.name + uuid.v4(),
        plugin: {
          name: action.name,
          type: action.type,
          artifact: action.defaultArtifact,
          properties: action.properties
        },
        description: vm.action.description
      };

      try {
        if (vm.mode === 'edit') {
          vm.actionCreator.editPostAction(vm.confirmedAction);
        } else {
          vm.actionCreator.addPostAction(vm.confirmedAction);
        }
      } catch (e) {
        console.log('ERROR', e); //FIXME: We should be able to handle errors more efficiently
      }

      $scope.$parent.$close();
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
  /* /my-post-run-action-wizard.js */

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
  angular.module(PKG.name + '.commons').directive('myPostRunActionWizard', function () {
    return {
      scope: {
        mode: '@',
        actionCreator: '=?',
        store: '=',
        action: '=?',
        errors: '=',
        validate: '&'
      },
      templateUrl: 'my-post-run-action-wizard/my-post-run-action-wizard.html',
      bindToController: true,
      controller: 'MyPostRunActionWizardCtrl',
      controllerAs: 'MyPostRunActionWizardCtrl'
    };
  }).service('myPostRunActionWizardService', ["$uibModal", function ($uibModal) {
    this.show = function (actionCreator, store, mode, action) {
      $uibModal.open({
        templateUrl: 'my-post-run-action-wizard/my-post-run-action-wizard-modal.html',
        backdrop: true,
        resolve: {
          rActionCreator: function rActionCreator() {
            return actionCreator || {};
          },
          rStore: function rStore() {
            return store;
          },
          rAction: function rAction() {
            return action || null;
          },
          rMode: function rMode() {
            return mode;
          }
        },
        size: 'lg',
        windowClass: 'post-run-actions-modal hydrator-modal node-config-modal',
        controller: ['$scope', 'rActionCreator', 'rStore', 'rMode', 'rAction', function ($scope, rActionCreator, rStore, rMode, rAction) {
          $scope.actionCreator = rActionCreator;
          $scope.store = rStore;
          $scope.mode = rMode;
          $scope.action = rAction;
          $scope.validating = false;
          $scope.errorCount = null;

          $scope.showValidateButton = function () {
            // Hack-y way of showing Validate button on Configure and Confirm pages only
            if ($scope.action) {
              return $scope.mode !== 'view' && Object.keys($scope.action).length > 0;
            }
          };

          $scope.validatePluginProperties = function (action, errorCallback) {
            var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if ($scope.validating) {
              return;
            }

            if (!silent) {
              $scope.validating = true;
            }

            action = action || angular.copy($scope.action);

            var errorCb = function errorCb(_ref) {
              var errorCount = _ref.errorCount,
                  propertyErrors = _ref.propertyErrors;

              if (!silent) {
                $scope.validating = false;
                $scope.errorCount = errorCount;
              } else {
                $scope.errorCount = null;
              }

              if (errorCount > 0 || !errorCount) {
                $scope.propertyErrors = propertyErrors;
              } else {
                $scope.propertyErrors = {};
              }

              if (errorCallback && typeof errorCallback === 'function') {
                errorCallback($scope.propertyErrors);
              }
            };

            $scope.store.HydratorPlusPlusPluginConfigFactory.validatePluginProperties(action, null, errorCb);
          };
        }]
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
  /* /wizard-configure-confirm-step/wizard-configure-confirm-step-ctrl.js */

  /*
   * Copyright © 2016-2019 Cask Data, Inc.
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
  var WizardConfigureConfirmStepCtrl = /*#__PURE__*/function () {
    WizardConfigureConfirmStepCtrl.$inject = ["$state", "myPipelineApi", "HydratorPlusPlusPluginConfigFactory", "GLOBALS"];
    function WizardConfigureConfirmStepCtrl($state, myPipelineApi, HydratorPlusPlusPluginConfigFactory, GLOBALS) {
      var _this = this;

      _classCallCheck(this, WizardConfigureConfirmStepCtrl);

      this.$state = $state;
      this.myPipelineApi = myPipelineApi;
      this.HydratorPlusPlusPluginConfigFactory = HydratorPlusPlusPluginConfigFactory;
      this.showLoadingIcon = true;
      this.action.properties = this.action.properties || {};
      this.widgetJson = {};
      this.requiredPropertyError = GLOBALS.en.hydrator.studio.error['GENERIC-MISSING-REQUIRED-FIELDS'];
      this.onChangeHandler = this.onChangeHandler.bind(this);
      this.validating = null;

      if (this.action && !Object.keys(this.action._backendProperties || {}).length) {
        this.pluginFetch(this.action).then(function () {
          return _this.showLoadingIcon = false;
        });
      } else {
        this.fetchWidgets(this.action);
      }
    } // Fetching Backend Properties


    _createClass(WizardConfigureConfirmStepCtrl, [{
      key: "pluginFetch",
      value: function pluginFetch(action) {
        var _this2 = this;

        var _action$defaultArtifa = action.defaultArtifact,
            name = _action$defaultArtifa.name,
            version = _action$defaultArtifa.version,
            scope = _action$defaultArtifa.scope;
        this.errorInConfig = false;
        var params = {
          namespace: this.$state.params.namespace,
          pipelineType: name,
          version: version,
          scope: scope,
          extensionType: action.type,
          pluginName: action.name
        };
        this.loadingPlugin = true;
        return this.myPipelineApi.fetchPostActionProperties(params).$promise.then(function (res) {
          _this2.action._backendProperties = res[0].properties;

          _this2.fetchWidgets(action);
        });
      } // Fetching Widget JSON for the plugin

    }, {
      key: "fetchWidgets",
      value: function fetchWidgets(action) {
        var _this3 = this;

        var _action$defaultArtifa2 = action.defaultArtifact,
            name = _action$defaultArtifa2.name,
            version = _action$defaultArtifa2.version,
            scope = _action$defaultArtifa2.scope;
        var artifact = {
          name: name,
          version: version,
          scope: scope,
          key: 'widgets.' + action.name + '-' + action.type
        };
        return this.HydratorPlusPlusPluginConfigFactory.fetchWidgetJson(artifact.name, artifact.version, artifact.scope, artifact.key).then(function (widgetJson) {
          _this3.widgetJson = widgetJson;
          _this3.loadingPlugin = false;
        }, function () {
          _this3.loadingPlugin = false;
        });
      }
    }, {
      key: "onChangeHandler",
      value: function onChangeHandler() {
        var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.action.properties = values;
      }
    }, {
      key: "addAction",
      value: function addAction(isClose) {
        var _this4 = this;

        if (this.validating) {
          return;
        }

        this.validating = true;

        var callback = function callback() {
          _this4.validating = false;
        };

        var fn = this.onActionConfigure();

        if ('undefined' !== typeof fn) {
          fn.call(null, isClose ? null : this.action, callback);
        }
      }
    }, {
      key: "gotoPreviousStep",
      value: function gotoPreviousStep() {
        var fn = this.onGotoPreviousStep();

        if ('undefined' !== typeof fn) {
          fn.call(null);
        }
      }
    }, {
      key: "onItemClicked",
      value: function onItemClicked(event, action) {
        event.stopPropagation();
        event.preventDefault();
        this.action = action;
        this.addAction();
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return WizardConfigureConfirmStepCtrl;
  }();

  angular.module(PKG.name + '.commons').controller('WizardConfigureConfirmStepCtrl', WizardConfigureConfirmStepCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /wizard-configure-confirm-step/wizard-configure-confirm-step.js */

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
  angular.module(PKG.name + '.commons').directive('wizardConfigureConfirmStep', function () {
    return {
      restrict: 'E',
      scope: {
        action: '=',
        isDisabled: '=',
        mode: '@',
        onActionConfigure: '&',
        onGotoPreviousStep: '&',
        errors: '='
      },
      templateUrl: 'my-post-run-action-wizard/wizard-configure-confirm-step/wizard-configure-confirm-step.html',
      controller: 'WizardConfigureConfirmStepCtrl',
      controllerAs: 'WizardConfigureConfirmStepCtrl',
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
  /* /wizard-select-action-step/wizard-select-action-step-ctrl.js */

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
  var WizardSelectActionStepCtrl = /*#__PURE__*/function () {
    WizardSelectActionStepCtrl.$inject = ["$scope", "$state", "myPipelineApi", "myHelpers", "GLOBALS"];
    function WizardSelectActionStepCtrl($scope, $state, myPipelineApi, myHelpers, GLOBALS) {
      var _this = this;

      _classCallCheck(this, WizardSelectActionStepCtrl);

      var artifact = this.store.getArtifact();
      this.postActionsList = [];
      this.$scope = $scope;

      this.onItemClicked = function (event, action) {
        this.chooseAction(action);
      };

      this.loadingPlugins = true;
      var params = {
        namespace: $state.params.namespace,
        pipelineType: artifact.name,
        version: artifact.version,
        extensionType: 'postaction'
      };
      myPipelineApi.fetchPlugins(params).$promise.then(function (res) {
        var filteredPlugins = _this.filterPlugins(res);

        _this.postActionsList = Object.keys(filteredPlugins).map(function (postaction) {
          // Coverting the name to lowercase before lookup as we can maintain a case insensitive map in case backend wants to change from camelcase or to any other case.
          return Object.assign({}, filteredPlugins[postaction], {
            template: '/assets/features/hydrator/templates/create/popovers/leftpanel-plugin-popover.html',
            label: myHelpers.objectQuery(GLOBALS.pluginTypes, 'post-run-actions', filteredPlugins[postaction].name.toLowerCase()) || filteredPlugins[postaction].name,
            description: filteredPlugins[postaction].description || ''
          });
        });
        _this.loadingPlugins = false;
      }, function (err) {
        _this.loadingPlugins = false;
        console.log('ERROR: ', err);
      });
    }

    _createClass(WizardSelectActionStepCtrl, [{
      key: "chooseAction",
      value: function chooseAction(action) {
        var fn = this.onActionSelect();

        if ('undefined' !== typeof fn) {
          fn.call(null, action);
        }
      }
    }, {
      key: "findLatestArtifact",
      value: function findLatestArtifact(plugin) {
        var allArtifacts = plugin.allArtifacts;
        var versions = allArtifacts.map(function (pa) {
          return pa.artifact.version;
        });
        var latestVersion = window.CaskCommon.VersionUtilities.findHighestVersion(versions, true);
        return allArtifacts.find(function (pa) {
          return pa.artifact.version === latestVersion;
        });
      }
    }, {
      key: "filterPlugins",
      value: function filterPlugins(results) {
        var _this2 = this;

        var pluginsMap = {};
        angular.forEach(results, function (plugin) {
          if (!pluginsMap[plugin.name]) {
            pluginsMap[plugin.name] = Object.assign({}, plugin, {
              defaultArtifact: plugin.artifact,
              allArtifacts: []
            });
          }

          pluginsMap[plugin.name].allArtifacts.push(plugin);

          var latestArtifact = _this2.findLatestArtifact(pluginsMap[plugin.name]);

          pluginsMap[plugin.name].defaultArtifact = latestArtifact.artifact;
        });
        return pluginsMap;
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return WizardSelectActionStepCtrl;
  }();

  WizardSelectActionStepCtrl.$inject = ['$scope', '$state', 'myPipelineApi', 'myHelpers', 'GLOBALS'];
  angular.module(PKG.name + '.commons').controller('WizardSelectActionStepCtrl', WizardSelectActionStepCtrl);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /wizard-select-action-step/wizard-select-action-step.js */

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
  angular.module(PKG.name + '.commons').directive('wizardSelectActionStep', function () {
    return {
      restrict: 'E',
      scope: {
        store: '=',
        onActionSelect: '&'
      },
      templateUrl: 'my-post-run-action-wizard/wizard-select-action-step/wizard-select-action-step.html',
      controller: 'WizardSelectActionStepCtrl',
      controllerAs: 'WizardSelectActionStepCtrl',
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
  /* /my-post-run-actions.js */

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
  angular.module(PKG.name + '.commons').directive('myPostRunActions', function () {
    return {
      restrict: 'E',
      scope: {
        actionCreator: '=',
        store: '=',
        isDisabled: '='
      },
      templateUrl: 'my-post-run-actions/my-post-run-actions.html',
      bindToController: true,
      controller: ['$scope', 'myPostRunActionWizardService', function ($scope, myPostRunActionWizardService) {
        var _this = this;

        $scope.myPostRunActionWizardService = myPostRunActionWizardService;
        var sub = this.store.registerOnChangeListener(function () {
          _this.actions = _this.store.getPostActions();
        });
        this.actions = this.store.getPostActions();

        this.deletePostRunAction = function (action) {
          this.actionCreator.deletePostAction(action);
        };

        $scope.$on('$destroy', function () {
          sub();
        });
      }],
      controllerAs: 'MyPostRunActionsCtrl'
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
  /* /widget-complex-schema-editor.js */

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
  ComplexSchemaEditorController.$inject = ["$scope", "EventPipe", "$timeout", "myAlertOnValium", "avsc", "myHelpers", "IMPLICIT_SCHEMA", "HydratorPlusPlusNodeService"];
  function ComplexSchemaEditorController($scope, EventPipe, $timeout, myAlertOnValium, avsc, myHelpers, IMPLICIT_SCHEMA, HydratorPlusPlusNodeService) {
    'ngInject';

    var vm = this;
    var schemaExportTimeout;
    var clearDOMTimeoutTick1;
    var clearDOMTimeoutTick2;
    var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
    vm.currentIndex = 0;
    vm.clearDOM = false;
    vm.implicitSchemaPresent = false;
    var watchProperty = myHelpers.objectQuery(vm.config, 'property-watch') || myHelpers.objectQuery(vm.config, 'widget-attributes', 'property-watch');

    if (watchProperty) {
      $scope.$watch(function () {
        return vm.pluginProperties[watchProperty];
      }, changeFormat);
    }

    function changeFormat() {
      var format = vm.pluginProperties[watchProperty];
      var availableImplicitSchema = Object.keys(IMPLICIT_SCHEMA);

      if (availableImplicitSchema.indexOf(format) === -1) {
        vm.implicitSchemaPresent = false;
        return;
      }

      vm.clearDOM = true;
      vm.implicitSchemaPresent = true;
      vm.schemas = IMPLICIT_SCHEMA[format];
      reRenderComplexSchema();
    }

    vm.formatOutput = function () {
      var updateDefault = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!Array.isArray(vm.schemas)) {
        var schema = vm.schemas.schema;

        if (!schema) {
          schema = '';
        }

        vm.schemas = [HydratorPlusPlusNodeService.getOutputSchemaObj(schema)];
      }

      var newOutputSchemas = vm.schemas.map(function (schema) {
        if (typeof schema.schema !== 'string') {
          schema.schema = JSON.stringify(schema.schema);
        }

        return schema;
      });

      if (vm.onChange && typeof vm.onChange === 'function') {
        vm.onChange({
          newOutputSchemas: newOutputSchemas
        });
      }

      if (vm.updateDefaultOutputSchema && updateDefault) {
        vm.updateDefaultOutputSchema({
          outputSchema: vm.schemas[0].schema
        });
      }
    };

    function exportSchema() {
      if (vm.url) {
        URL.revokeObjectURL(vm.url);
      }

      if (!vm.schemas) {
        vm.error = 'Cannot export empty schema';
        return;
      }

      vm.schemas = vm.schemas.map(function (schema) {
        try {
          schema.schema = JSON.parse(schema.schema);
        } catch (e) {
          console.log('ERROR: ', e);
          schema.schema = {
            fields: []
          };
        }

        return schema;
      });
      var blob = new Blob([JSON.stringify(vm.schemas, null, 4)], {
        type: 'application/json'
      });
      vm.url = URL.createObjectURL(blob);
      vm.exportFileName = 'schema';
      $timeout.cancel(schemaExportTimeout);
      schemaExportTimeout = $timeout(function () {
        document.getElementById('schema-export-link').click();
      });
    }

    function reRenderComplexSchema() {
      vm.clearDOM = true;
      $timeout.cancel(clearDOMTimeoutTick1);
      $timeout.cancel(clearDOMTimeoutTick2);
      clearDOMTimeoutTick1 = $timeout(function () {
        clearDOMTimeoutTick2 = $timeout(function () {
          vm.clearDOM = false;
        }, 500);
      });
    }

    function handleDatasetSelected(schema, format, isDisabled, datasetId) {
      if (watchProperty && format) {
        vm.pluginProperties[watchProperty] = format;
      } // This angular lodash doesn't seem to have isNil
      // have to do this instead of just checking if (isDisabled) because isDisabled might be false


      if (!_.isUndefined(isDisabled) && !_.isNull(isDisabled)) {
        vm.isDisabled = isDisabled;
      }

      if (datasetId) {
        vm.derivedDatasetId = datasetId;
      }

      if (!_.isEmpty(schema) || _.isEmpty(schema) && vm.isDisabled) {
        vm.schemas[0].schema = schema;
        vm.formatOutput();
      } else {
        // if dataset name is changed to a non-existing dataset, the schemaObj will be empty,
        // so assign to it the value of the input schema
        if (vm.isDisabled === false && vm.inputSchema) {
          if (vm.inputSchema.length > 0 && vm.inputSchema[0].schema) {
            vm.schemas[0].schema = angular.copy(vm.inputSchema[0].schema);
          } else {
            vm.schemas[0].schema = '';
          }
        }
      }

      reRenderComplexSchema();
    }

    eventEmitter.on('dataset.selected', handleDatasetSelected);
    eventEmitter.on('schema.export', exportSchema);

    function clearSchema() {
      vm.schemas = [HydratorPlusPlusNodeService.getOutputSchemaObj('')];
      reRenderComplexSchema();
    }

    function onSchemaImport(schemas) {
      vm.clearDOM = true;
      vm.error = '';

      if (typeof schemas === 'string') {
        schemas = JSON.parse(schemas);
      }

      if (!Array.isArray(schemas)) {
        schemas = [HydratorPlusPlusNodeService.getOutputSchemaObj(schemas)]; // this is for converting old schemas (pre 4.3.2) to new format
      } else if (Array.isArray(schemas) && schemas.length && !schemas[0].hasOwnProperty('schema')) {
        schemas = [HydratorPlusPlusNodeService.getOutputSchemaObj(HydratorPlusPlusNodeService.getSchemaObj(schemas))];
      }

      vm.schemas = schemas.map(function (schema) {
        var jsonSchema = schema.schema;

        try {
          if (typeof jsonSchema === 'string') {
            jsonSchema = JSON.parse(jsonSchema);
          }

          if (Array.isArray(jsonSchema)) {
            var recordTypeSchema = {
              name: 'etlSchemaBody',
              type: 'record',
              fields: jsonSchema
            };
            jsonSchema = recordTypeSchema;
          } else if (jsonSchema.type !== 'record') {
            myAlertOnValium.show({
              type: 'danger',
              content: 'Imported schema is not a valid Avro schema'
            });
            vm.clearDOM = false;
            return;
          } // TODO(CDAP-13010): for splitters, the backend returns port names similar to [schemaName].string or [schemaName].int.
          // However, some weird parsing code in the avsc library doesn't allow primitive type names to be after periods(.),
          // so we have to manually make this change here. Ideally the backend should provide a different syntax for port
          // names so that we don't have to do this hack in the UI.


          if (jsonSchema.name) {
            jsonSchema.name = jsonSchema.name.replace('.', '.type');
          }

          schema.schema = avsc.parse(jsonSchema, {
            wrapUnions: true
          });
          return schema;
        } catch (e) {
          vm.error = 'Imported schema is not a valid Avro schema: ' + e;
          vm.clearDOM = false;
          return schema;
        }
      });
      reRenderComplexSchema();
    }

    eventEmitter.on('schema.clear', clearSchema);
    eventEmitter.on('schema.import', onSchemaImport);
    $scope.$on('$destroy', function () {
      eventEmitter.off('dataset.selected', handleDatasetSelected);
      eventEmitter.off('schema.clear', clearSchema);
      eventEmitter.off('schema.export', exportSchema);
      eventEmitter.off('schema.import', onSchemaImport);
      URL.revokeObjectURL($scope.url);
      $timeout.cancel(schemaExportTimeout);
      $timeout.cancel(clearDOMTimeoutTick1);
      $timeout.cancel(clearDOMTimeoutTick2);
    });
  }

  angular.module(PKG.name + '.commons').directive('myComplexSchemaEditor', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-complex-schema-editor/widget-complex-schema-editor.html',
      bindToController: true,
      scope: {
        schemas: '=',
        inputSchema: '=?',
        isDisabled: '=',
        pluginProperties: '=?',
        config: '=?',
        pluginName: '=',
        updateDefaultOutputSchema: '&',
        onChange: '&',
        isInStudio: '=',
        errors: '='
      },
      controller: ComplexSchemaEditorController,
      controllerAs: 'SchemaEditor'
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
  /* /widget-container.js */

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
  angular.module(PKG.name + '.commons').directive('widgetContainer', ["$compile", "$window", "WidgetFactory", function ($compile, $window, WidgetFactory) {
    return {
      restrict: 'A',
      scope: {
        name: '=',
        disabled: '=',
        model: '=',
        myconfig: '=',
        properties: '=',
        widgetDisabled: '=',
        inputSchema: '=',
        stageName: '=',
        isFieldRequired: '=',
        node: '='
      },
      replace: false,
      link: function link(scope, element) {
        var angularElement, widget, fieldset;
        element.removeAttr('widget-container');
        widget = WidgetFactory.registry[scope.myconfig.widget] || WidgetFactory.registry[scope.myconfig['widget-type']];

        if (!widget) {
          widget = WidgetFactory.registry['__default__'];
        }

        fieldset = angular.element('<fieldset></fieldset>');
        fieldset.attr('ng-disabled', scope.widgetDisabled);
        angularElement = angular.element(widget.element);

        scope.onChange = function (value) {
          var isChangingMoreThanOnePluginProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var updatedPluginProperties = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          if (!isChangingMoreThanOnePluginProperty) {
            scope.model = value;
          } else {
            scope.properties = Object.assign({}, scope.properties, updatedPluginProperties);
          }
        };

        angular.forEach(widget.attributes, function (value, key) {
          if (key.indexOf('data-') !== -1) {
            angularElement.attr(key, '::' + value);
            return;
          }

          angularElement.attr(key, value);
        });
        fieldset.append(angularElement);
        var content = $compile(fieldset)(scope);
        element.append(content);
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
  /* /widget-factory.js */

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
  angular.module(PKG.name + '.commons').service('WidgetFactory', function () {
    this.registry = {
      'number': {
        element: '<number></number>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'textbox': {
        element: '<text-box></text-box>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'textarea': {
        element: '<code-editor></code-editor>',
        attributes: {
          'value': 'model',
          'mode': '"plain_text"',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'rows': '{{myconfig["widget-attributes"].rows}}'
        }
      },
      'password': {
        element: '<my-password></my-password>',
        attributes: {
          'ng-model': 'model',
          'ng-trim': 'false'
        }
      },
      'csv': {
        element: '<csv-widget></csv-widget>',
        attributes: {
          'value': 'model',
          'widget-props': 'myconfig["widget-attributes"]',
          'on-change': 'onChange',
          'disabled': 'disabled'
        }
      },
      'dsv': {
        element: '<csv-widget></csv-widget>',
        attributes: {
          'value': 'model',
          'widget-props': 'myconfig["widget-attributes"]',
          'on-change': 'onChange',
          'disabled': 'disabled'
        }
      },
      'ds-multiplevalues': {
        element: '<multiple-values-widget></multiple-values-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'json-editor': {
        element: '<json-editor></json-editor>',
        attributes: {
          'value': 'model',
          'mode': '"json"',
          'on-change': 'onChange',
          'disabled': 'disabled'
        }
      },
      'javascript-editor': {
        element: '<code-editor></code-editor>',
        attributes: {
          'value': 'model',
          'mode': '"javascript"',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'rows': 25
        }
      },
      'python-editor': {
        element: '<code-editor></code-editor>',
        attributes: {
          'value': 'model',
          'mode': '"python"',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'rows': 25
        }
      },
      'scala-editor': {
        element: '<code-editor></code-editor>',
        attributes: {
          'value': 'model',
          'mode': '"scala"',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'rows': 25
        }
      },
      'sql-editor': {
        element: '<code-editor></code-editor>',
        attributes: {
          'value': 'model',
          'mode': '"sql"',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'rows': 15
        }
      },
      // 'schema': {
      //   element: '<my-schema-editor></my-schema-editor>',
      //   attributes: {
      //     'ng-model': 'model',
      //     'data-config': 'myconfig'
      //   }
      // },
      'keyvalue': {
        element: '<key-value-widget></key-value-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'keyvalue-encoded': {
        element: '<key-value-encoded-widget></key-value-encoded-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'keyvalue-dropdown': {
        element: '<key-value-dropdown-widget></key-value-dropdown-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'function-dropdown-with-alias': {
        element: '<function-dropdown-alias-widget></function-dropdown-alias-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      // 'schedule': {
      //   element: '<my-schedule></my-schedule>',
      //   attributes: {
      //     'ng-model': 'model',
      //     'data-config': 'myconfig'
      //   }
      // },
      'select': {
        element: '<select-dropdown></select-dropdown>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'dataset-selector': {
        element: '<dataset-selector-widget></dataset-selector-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'sql-select-fields': {
        element: '<sql-selector-widget></sql-selector-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'extra-config': '{ inputSchema: {{ inputSchema }} }'
        }
      },
      'join-types': {
        element: '<join-type-widget></join-type-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'extra-config': '{ inputSchema: {{ inputSchema }} }'
        }
      },
      'sql-conditions': {
        element: '<sql-conditions-widget></sql-conditions-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'extra-config': '{ inputSchema: {{ inputSchema }} }'
        }
      },
      'input-field-selector': {
        element: '<input-field-dropdown></input-field-dropdown>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'extra-config': '{ inputSchema: {{ inputSchema }} }'
        }
      },
      'wrangler-directives': {
        element: '<wrangler-editor></wrangler-editor>',
        attributes: {
          'value': 'model',
          'disabled': 'disabled',
          'data-config': 'myconfig',
          'properties': 'properties',
          'on-change': 'onChange'
        }
      },
      'rules-engine-editor': {
        element: '<my-rules-engine-editor></my-rules-engine-editor>',
        attributes: {
          'ng-model': 'model',
          'data-config': 'myconfig',
          'properties': 'properties'
        }
      },
      // 'textarea-validate': {
      //   element: '<my-textarea-validate></my-textarea-validate>',
      //   attributes: {
      //     'ng-model': 'model',
      //     'config': 'myconfig',
      //     'disabled': 'disabled',
      //     'node': 'node'
      //   }
      // },
      'multi-select': {
        element: '<multi-select></multi-select>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'radio-group': {
        element: '<radio-group-widget></radio-group-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      },
      'toggle': {
        element: '<toggle-switch-widget></toggle-switch-widget>',
        attributes: {
          'value': 'model',
          'on-change': 'onChange',
          'disabled': 'disabled',
          'widget-props': 'myconfig["widget-attributes"]'
        }
      }
    };
    this.registry['__default__'] = this.registry['textbox'];
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /widget-dataset-selector/widget-dataset-selector.js */

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
  angular.module(PKG.name + '.commons').directive('myDatasetSelector', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        datasetType: '@',
        stageName: '='
      },
      templateUrl: 'widget-container/widget-dataset-selector/widget-dataset-selector.html',
      controller: ["$scope", "myDatasetApi", "$state", "EventPipe", "$uibModal", function controller($scope, myDatasetApi, $state, EventPipe, $uibModal) {
        $scope.textPlaceholder = '';

        if ($scope.config['widget-attributes'] && $scope.config['widget-attributes']['placeholder']) {
          $scope.textPlaceholder = $scope.config['widget-attributes']['placeholder'];
        }

        var resource = myDatasetApi;
        $scope.list = [];
        var params = {
          namespace: $state.params.namespace || $state.params.nsadmin
        };
        var dataMap = []; // This variable is to make sure that when the name of the dataset is changed
        // from a non-existing dataset to another non-existing one, then the schema is
        // not updated. However, the schema will be updated when changing from a non-existing
        // schema to an existing one, or vice versa

        var isCurrentlyExistingDataset;
        var initialized = false;
        var schema;
        var oldDataset;
        var newDataset;
        var modalOpen = false;
        var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);

        var showPopupFunc = function showPopupFunc(schema, oldDatasetName) {
          var sinkName = $scope.stageName;
          var confirmModal = $uibModal.open({
            templateUrl: '/assets/features/hydrator/templates/create/popovers/change-dataset-confirmation.html',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            windowTopClass: 'confirm-modal hydrator-modal center',
            controller: ['$scope', function ($scope) {
              $scope.datasetName = params.datasetId;
              $scope.sinkName = sinkName;
            }]
          });
          modalOpen = true;
          confirmModal.result.then(function (confirm) {
            if (confirm) {
              isCurrentlyExistingDataset = true;

              if (!schema) {
                $scope.schemaError = true;
                eventEmitter.emit('schema.clear');
              } else {
                $scope.schemaError = false;
                EventPipe.emit('dataset.selected', schema, null, true, $scope.model);
              }
            } else {
              $scope.model = oldDatasetName;
            }

            modalOpen = false;
          });
        };

        var debouncedPopup = _.debounce(showPopupFunc, 1500);

        resource.list(params).$promise.then(function (res) {
          $scope.list = res;
          dataMap = res.map(function (d) {
            return d.name;
          });

          if (dataMap.indexOf($scope.model) === -1) {
            isCurrentlyExistingDataset = false;
          } else {
            isCurrentlyExistingDataset = true;
          }
        });

        $scope.showConfirmationModal = function () {
          if (oldDataset !== newDataset) {
            params.datasetId = newDataset;
            resource.get(params).$promise.then(function (res) {
              schema = res.spec.properties.schema;

              if (!isCurrentlyExistingDataset && dataMap.indexOf(newDataset) !== -1) {
                if (debouncedPopup) {
                  debouncedPopup.cancel();
                }

                showPopupFunc(schema, oldDataset);
              }
            });
          }
        };

        $scope.$watch('model', function (newDatasetName, oldDatasetName) {
          oldDataset = oldDatasetName;
          newDataset = newDatasetName;
          $scope.schemaError = false;

          if (debouncedPopup) {
            debouncedPopup.cancel();
          }

          if (dataMap.length === 0) {
            initialized = true;
          }

          if (isCurrentlyExistingDataset && dataMap.length > 0 && dataMap.indexOf($scope.model) === -1) {
            EventPipe.emit('dataset.selected', '', null, false);
            isCurrentlyExistingDataset = false;
            return;
          }

          params.datasetId = $scope.model;
          resource.get(params).$promise.then(function (res) {
            if ($scope.datasetType === 'dataset') {
              schema = res.spec.properties.schema;

              if (initialized && !isCurrentlyExistingDataset && newDataset !== oldDataset) {
                if (!modalOpen) {
                  debouncedPopup(schema, oldDataset);
                }
              } else {
                initialized = true;

                if (schema) {
                  EventPipe.emit('dataset.selected', schema, null, true, $scope.model);
                }
              }
            }
          });
        });
        $scope.$on('$destroy', function () {
          EventPipe.cancelEvent('dataset.selected');

          if (debouncedPopup) {
            debouncedPopup.cancel();
          }
        });
      }]
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
  /* /widget-ds-multiplevalues/widget-ds-multiplevalues.js */

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
  angular.module(PKG.name + '.commons').directive('myDsMultipleValues', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '='
      },
      templateUrl: 'widget-container/widget-ds-multiplevalues/widget-ds-multiplevalues.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.valuesdelimiter = myHelpers.objectQuery($scope.config, 'widget-attributes', 'values-delimiter') || ':';
        $scope.delimiter = myHelpers.objectQuery($scope.config, 'widget-attributes', 'delimiter') || ',';
        $scope.numValues = myHelpers.objectQuery($scope.config, 'widget-attributes', 'numValues') || 2;
        $scope.placeholders = myHelpers.objectQuery($scope.config, 'widget-attributes', 'placeholders') || [];
        $scope.numValues = parseInt($scope.numValues, 10); // initializing

        function initialize() {
          var str = $scope.model;
          $scope.properties = [];

          if (!str) {
            //intialize to one empty property
            $scope.properties.push({
              values: Array($scope.numValues).join('.').split('.')
            });
            return;
          }

          var arr = str.split($scope.delimiter);
          angular.forEach(arr, function (a) {
            var split = a.split($scope.valuesdelimiter);
            $scope.properties.push({
              values: split
            });
          });
        }

        initialize();
        $scope.$watch('properties', function () {
          var str = '';
          angular.forEach($scope.properties, function (p) {
            var isAnyEmptyValue = p.values.filter(function (val) {
              return val.length === 0;
            });

            if (isAnyEmptyValue.length) {
              return;
            }

            str = str + p.values.join($scope.valuesdelimiter) + $scope.delimiter;
          }); // remove last delimiter

          if (str.length > 0 && str.charAt(str.length - 1) === $scope.delimiter) {
            str = str.substring(0, str.length - 1);
          }

          $scope.model = str;
        }, true);

        $scope.addProperty = function () {
          $scope.properties.push({
            values: Array($scope.numValues).join('.').split('.'),
            newField: 'add'
          });
        };

        $scope.removeProperty = function (property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };
      }]
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
  /* /widget-dsv/widget-dsv.js */

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
  angular.module(PKG.name + '.commons').directive('myDsv', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        delimiter: '@',
        type: '@',
        config: '='
      },
      templateUrl: 'widget-container/widget-dsv/widget-dsv.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.placeholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-placeholder') || 'value';
        var delimiter = $scope.delimiter || ','; // initializing

        function initialize() {
          var str = $scope.model;
          $scope.properties = [];

          if (!str) {
            // initialize with empty value
            $scope.properties.push({
              value: ''
            });
            return;
          }

          var arr = str.split(delimiter);
          angular.forEach(arr, function (a) {
            $scope.properties.push({
              value: a
            });
          });
        }

        initialize();
        var propertyListener = $scope.$watch('properties', function () {
          var str = '';
          angular.forEach($scope.properties, function (p) {
            if (p.value) {
              str = str + p.value + delimiter;
            }
          }); // remove last delimiter

          if (str.length > 0 && str.charAt(str.length - 1) === delimiter) {
            str = str.substring(0, str.length - 1);
          }

          $scope.model = str;
        }, true);
        $scope.$on('$destroy', function () {
          propertyListener();
        });

        $scope.addProperty = function () {
          $scope.properties.push({
            value: '',
            newField: 'add'
          });
        };

        $scope.removeProperty = function (property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };
      }]
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
  /* /widget-function-dropdown-with-alias/widget-function-dropdown-with-alias.js */

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
  angular.module(PKG.name + '.commons').directive('myFunctionDropdownWithAlias', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '='
      },
      templateUrl: 'widget-container/widget-function-dropdown-with-alias/widget-function-dropdown-with-alias.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.functionAliasList = [];
        $scope.placeholders = myHelpers.objectQuery($scope.config, 'widget-attributes', 'placeholders');
        $scope.dropdownOptions = myHelpers.objectQuery($scope.config, 'widget-attributes', 'dropdownOptions');

        if (angular.isObject($scope.placeholders)) {
          $scope.aliasPlaceholder = $scope.placeholders.alias || '';
          $scope.fieldPlaceholder = $scope.placeholders.field || '';
        }

        $scope.addFunctionAlias = function () {
          $scope.functionAliasList.push({
            functionName: '',
            field: '',
            alias: ''
          });
        };

        $scope.removeFunctionAlias = function (index) {
          $scope.functionAliasList.splice(index, 1);

          if (!$scope.functionAliasList.length) {
            $scope.addFunctionAlias();
          }
        };

        $scope.convertInternalToExternalModel = function () {
          var externalModel = '';
          $scope.functionAliasList.forEach(function (fnAlias) {
            if ([fnAlias.functionName.length, fnAlias.field.length, fnAlias.alias.length].indexOf(0) !== -1) {
              return;
            }

            if (externalModel.length) {
              externalModel += ',';
            }

            externalModel += fnAlias.alias + ':' + fnAlias.functionName + '(' + fnAlias.field + ')';
          });
          return externalModel;
        };

        $scope.convertExternalToInternalModel = function () {
          var functionsAliasList = $scope.model.split(',');
          functionsAliasList.forEach(function (fnAlias) {
            if (!fnAlias.length) {
              return;
            }

            var aliasEndIndex = fnAlias.indexOf(':');
            var fnEndIndex = fnAlias.indexOf('(');
            var fieldEndIndex = fnAlias.indexOf(')');

            if ([aliasEndIndex, fnEndIndex, fieldEndIndex].indexOf(-1) !== -1) {
              return;
            }

            $scope.functionAliasList.push({
              alias: fnAlias.substring(0, aliasEndIndex),
              functionName: fnAlias.substring(aliasEndIndex + 1, fnEndIndex),
              field: fnAlias.substring(fnEndIndex + 1, fieldEndIndex)
            });
          });
        };

        if ($scope.model && $scope.model.length) {
          $scope.convertExternalToInternalModel();
        } else {
          $scope.addFunctionAlias();
        }

        $scope.$watch('functionAliasList', function () {
          $scope.model = $scope.convertInternalToExternalModel();
        }, true);
      }]
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
  /* /widget-input-field-selector/widget-input-field-selector.js */

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
  FieldSelectorController.$inject = ["myHelpers"];
  function FieldSelectorController(myHelpers) {
    'ngInject';

    var vm = this;
    vm.fieldOptions = [];

    function init() {
      if (!vm.inputSchema || vm.inputSchema.length === 0) {
        return;
      }

      try {
        var schema = JSON.parse(vm.inputSchema[0].schema);
        vm.fieldOptions = schema.fields.map(function (field) {
          return {
            name: field.name,
            value: field.name
          };
        });
        var isEnableAllOptionsSet = myHelpers.objectQuery(vm.config, 'widget-attributes', 'enableAllOptions');

        if (!vm.model && isEnableAllOptionsSet) {
          vm.model = vm.config['widget-attributes'].allOptionValue || '*';
        }

        if (isEnableAllOptionsSet) {
          vm.fieldOptions.unshift({
            name: vm.config['widget-attributes'].allOptionValue || '*',
            value: vm.config['widget-attributes'].allOptionValue || '*'
          });
        }
      } catch (e) {
        console.log('Error', e);
      }
    }

    init();
  }

  angular.module(PKG.name + '.commons').directive('myInputFieldSelector', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-input-field-selector/widget-input-field-selector.html',
      bindToController: true,
      scope: {
        model: '=ngModel',
        inputSchema: '=',
        config: '='
      },
      controller: FieldSelectorController,
      controllerAs: 'FieldSelector'
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
  /* /widget-input-schema/widget-input-schema-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('MyInputSchemaCtrl', ["$scope", "HydratorPlusPlusHydratorService", function ($scope, HydratorPlusPlusHydratorService) {
    this.multipleInputs = $scope.multipleInputs === 'true' ? true : false;

    try {
      this.inputSchemas = JSON.parse($scope.inputSchema);
    } catch (e) {
      this.inputSchemas = [];
    }

    this.inputSchemas = this.inputSchemas.map(function (node) {
      if (typeof node.schema === 'string' && HydratorPlusPlusHydratorService.containsMacro(node.schema)) {
        return {
          name: node.name,
          schema: node.schema,
          isMacro: true
        };
      }

      var schema;

      try {
        schema = JSON.parse(node.schema);
      } catch (e) {
        schema = {
          'name': 'etlSchemaBody',
          'type': 'record',
          'fields': []
        };
      }

      return {
        name: node.name,
        schema: schema,
        isMacro: false
      };
    });
    this.currentIndex = 0;
    this.isInStudio = $scope.isInStudio;
  }]);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /widget-input-schema/widget-input-schema.js */

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
  angular.module(PKG.name + '.commons').directive('myInputSchema', function () {
    return {
      restrict: 'EA',
      scope: {
        inputSchema: '@',
        multipleInputs: '@',
        isInStudio: '=',
        errors: '='
      },
      templateUrl: 'widget-container/widget-input-schema/widget-input-schema.html',
      controller: 'MyInputSchemaCtrl',
      controllerAs: 'MyInputSchemaCtrl'
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
  /* /widget-join-types/widget-join-types.js */

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
  function JoinTypesController() {
    'ngInject';

    var vm = this;
    vm.optionsDropdown = ['Inner', 'Outer'];
    vm.selectedCount = 0;

    vm.changeJoinType = function () {
      angular.forEach(vm.inputs, function (input) {
        input.selected = vm.joinType === 'Inner';
      });
      vm.formatOutput();
    };

    vm.formatOutput = function () {
      var outputArr = [];
      vm.selectedCount = 0;
      angular.forEach(vm.inputs, function (input) {
        if (input.selected) {
          outputArr.push(input.name);
          vm.selectedCount++;
        }
      });
      vm.model = outputArr.join(',');
    };

    function init() {
      vm.joinType = 'Outer';
      vm.inputs = [];

      if (!vm.model) {
        // initialize all to selected when model is empty
        angular.forEach(vm.inputSchema, function (input) {
          vm.inputs.push({
            name: input.name,
            selected: false
          });
        });
        vm.formatOutput();
        return;
      }

      var initialModel = vm.model.split(',').map(function (input) {
        return input.trim();
      });

      if (initialModel.length === vm.inputSchema.length) {
        vm.joinType = 'Inner';
        angular.forEach(vm.inputSchema, function (input) {
          vm.inputs.push({
            name: input.name,
            selected: true
          });
        });
        vm.formatOutput();
        return;
      }

      angular.forEach(vm.inputSchema, function (input) {
        vm.inputs.push({
          name: input.name,
          selected: initialModel.indexOf(input.name) !== -1 ? true : false
        });
      });
    }

    init();
  }

  angular.module(PKG.name + '.commons').directive('myJoinTypes', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-join-types/widget-join-types.html',
      bindToController: true,
      scope: {
        model: '=ngModel',
        inputSchema: '='
      },
      controller: JoinTypesController,
      controllerAs: 'JoinTypes'
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
  /* /widget-js-editor/widget-js-editor.js */

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
  var LINE_HEIGHT = 20; // roughly line height used in plugin modal

  var DEFAULT_TEXTAREA_HEIGHT = 100;
  var DEFAULT_CODE_EDITOR_HEIGHT = 500;
  angular.module(PKG.name + '.commons').directive('myAceEditor', ["$window", function ($window) {
    return {
      restrict: 'EA',
      scope: {
        model: '=ngModel',
        config: '=',
        mode: '@',
        disabled: '=',
        rows: '@'
      },
      template: "<div ui-ace=\"aceoptions\"\n                ng-model=\"model\"\n                ng-readonly=\"disabled\"\n                ng-class=\"{'form-control': mode === 'plain_text'}\"\n                ng-style=\"editorStyle\"></div>",
      controller: ["$scope", function controller($scope) {
        var config = $window.ace.require('ace/config');

        config.set('modePath', '/assets/bundle/ace-editor-worker-scripts/');
        $scope.aceoptions = {
          workerPath: '/assets/bundle/ace-editor-worker-scripts',
          mode: $scope.mode || 'javascript',
          useWrapMode: true,
          newLineMode: 'unix',
          advanced: {
            tabSize: 2
          }
        };
        var height; // textarea widget

        if ($scope.mode && ['plain_text', 'sql'].indexOf($scope.mode) !== -1) {
          height = DEFAULT_TEXTAREA_HEIGHT;

          if ($scope.rows && $scope.rows > 0) {
            height = $scope.rows * LINE_HEIGHT;
          }
        } else {
          // default height for other code editors (e.g. Python, Javascript)
          height = DEFAULT_CODE_EDITOR_HEIGHT;
        }

        $scope.editorStyle = {
          height: height + 'px'
        };
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
  /* /widget-json-editor/widget-json-editor.js */

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
  angular.module(PKG.name + '.commons').directive('myJsonTextbox', function () {
    return {
      restrict: 'EA',
      scope: {
        model: '=ngModel',
        placeholder: '=',
        disabled: '=',
        cy: '@'
      },
      controllerAs: 'JsonEditor',
      bindToController: true,
      templateUrl: 'widget-container/widget-json-editor/widget-json-editor.html',
      controller: ["$scope", function controller($scope) {
        var vm = this;
        vm.warning = null;

        function attemptParse(input) {
          try {
            var parsedModel = angular.fromJson(input);
            vm.internalModel = angular.toJson(parsedModel, true);
            vm.warning = null;
          } catch (e) {
            vm.internalModel = input;
            vm.warning = 'Value is not a JSON';
          }
        }

        function initialize() {
          attemptParse(vm.model);
        }

        initialize();

        vm.tidy = function () {
          attemptParse(vm.internalModel);
        };

        $scope.$watch('JsonEditor.internalModel', function (oldVal, newVal) {
          if (oldVal !== newVal) {
            // removing newlines
            try {
              var parsed = angular.fromJson(vm.internalModel);
              vm.model = angular.toJson(parsed);
            } catch (e) {
              vm.model = vm.internalModel;
            }
          }
        });
      }]
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
  /* /widget-keyvalue/widget-keyvalue.js */

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
  angular.module(PKG.name + '.commons').directive('myKeyValue', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        isDropdown: '='
      },
      templateUrl: 'widget-container/widget-keyvalue/widget-keyvalue.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.kvdelimiter = myHelpers.objectQuery($scope.config, 'kv-delimiter') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'kv-delimiter') || ':';
        $scope.delimiter = myHelpers.objectQuery($scope.config, 'delimiter') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'delimiter') || ',';
        $scope.keyPlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-placeholder') || 'key';
        $scope.valuePlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-placeholder') || 'value'; // Changing value field to dropdown based on config

        if ($scope.isDropdown) {
          $scope.dropdownOptions = myHelpers.objectQuery($scope.config, 'widget-attributes', 'dropdownOptions');
        } // initializing


        function initialize() {
          var str = $scope.model;
          $scope.properties = [];

          if (!str) {
            //intialize to one empty property
            $scope.properties.push({
              key: '',
              value: ''
            });
            return;
          }

          var arr = str.split($scope.delimiter);
          angular.forEach(arr, function (a) {
            var split = a.split($scope.kvdelimiter);
            $scope.properties.push({
              key: split[0],
              value: split[1]
            });
          });
        }

        initialize();
        $scope.$watch('properties', function () {
          var str = '';
          angular.forEach($scope.properties, function (p) {
            if (p.key.length > 0) {
              str = str + p.key + $scope.kvdelimiter + p.value + $scope.delimiter;
            }
          }); // remove last delimiter

          if (str.length > 0 && str.charAt(str.length - 1) === $scope.delimiter) {
            str = str.substring(0, str.length - 1);
          }

          $scope.model = str;
        }, true);

        $scope.addProperty = function () {
          $scope.properties.push({
            key: '',
            value: '',
            newField: 'add'
          });
        };

        $scope.removeProperty = function (property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };
      }]
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
  /* /widget-keyvalue-encoded/widget-keyvalue-encoded.js */

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
  angular.module(PKG.name + '.commons').directive('myKeyValueEncoded', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        isDropdown: '='
      },
      templateUrl: 'widget-container/widget-keyvalue-encoded/widget-keyvalue-encoded.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.kvdelimiter = myHelpers.objectQuery($scope.config, 'kv-delimiter') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'kv-delimiter') || ':';
        $scope.delimiter = myHelpers.objectQuery($scope.config, 'delimiter') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'delimiter') || ',';
        $scope.keyPlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'key-placeholder') || 'key';
        $scope.valuePlaceholder = myHelpers.objectQuery($scope.config, 'widget-attributes', 'value-placeholder') || 'value'; // Changing value field to dropdown based on config

        if ($scope.isDropdown) {
          $scope.dropdownOptions = myHelpers.objectQuery($scope.config, 'widget-attributes', 'dropdownOptions');
        } // initializing


        function initialize() {
          var str = $scope.model;
          $scope.properties = [];

          if (!str) {
            //intialize to one empty property
            $scope.properties.push({
              key: '',
              value: ''
            });
            return;
          }

          var arr = str.split($scope.delimiter);
          angular.forEach(arr, function (a) {
            var split = a.split($scope.kvdelimiter);
            $scope.properties.push({
              key: decodeURIComponent(split[0]),
              value: decodeURIComponent(split[1])
            });
          });
        }

        initialize();
        $scope.$watch('properties', function () {
          var str = '';
          angular.forEach($scope.properties, function (p) {
            if (p.key.length > 0) {
              str = str + encodeURIComponent(p.key) + $scope.kvdelimiter + encodeURIComponent(p.value) + $scope.delimiter;
            }
          }); // remove last delimiter

          if (str.length > 0 && str.charAt(str.length - 1) === $scope.delimiter) {
            str = str.substring(0, str.length - 1);
          }

          $scope.model = str;
        }, true);

        $scope.addProperty = function () {
          $scope.properties.push({
            key: '',
            value: '',
            newField: 'add'
          });
        };

        $scope.removeProperty = function (property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);
        };

        $scope.enter = function (event, last) {
          if (last && event.keyCode === 13) {
            $scope.addProperty();
          }
        };
      }]
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
  /* /widget-multi-select-dropdown/widget-multi-select-dropdown.js */

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
  angular.module(PKG.name + '.commons').directive('myMultiSelectDropdown', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '='
      },
      templateUrl: 'widget-container/widget-multi-select-dropdown/widget-multi-select-dropdown.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        $scope.extraSettings = {
          externalProp: '',
          checkBoxes: true
        };
        $scope.selectedOptions = [];
        $scope.delimiter = myHelpers.objectQuery($scope.config, 'widget-attributes', 'delimiter') || ',';
        $scope.options = myHelpers.objectQuery($scope.config, 'widget-attributes', 'options') || [];
        $scope.options = $scope.options.map(function (option) {
          return {
            id: option.id,
            label: option.label || option.id
          };
        });
        var defaultValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'defaultValue') || [];

        if ($scope.model) {
          $scope.model.split($scope.delimiter).forEach(function (value) {
            var valueInOption = $scope.options.find(function (op) {
              return op.id === value;
            });

            if (valueInOption) {
              $scope.selectedOptions.push(valueInOption);
            } else {
              var unknownValue = {
                id: value,
                label: 'UnKnown Value (' + value + '). Not part of options'
              };
              $scope.options.push(unknownValue);
              $scope.selectedOptions.push(unknownValue);
            }
          });
        } else {
          var defaultOption;
          defaultOption = defaultValue.map(function (value) {
            return $scope.options.find(function (op) {
              return op.id === value;
            });
          }).filter(function (value) {
            return value;
          });

          if (defaultOption.length) {
            $scope.selectedOptions = $scope.selectedOptions.concat(defaultOption);
          }
        }

        $scope.$watch('selectedOptions', function () {
          $scope.model = $scope.selectedOptions.map(function (o) {
            return o.id;
          }).join($scope.delimiter);
        }, true);
      }]
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
  /* /widget-number/widget-number.js */

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
  angular.module(PKG.name + '.commons').directive('myNumberWidget', function () {
    return {
      restrict: 'E',
      scope: {
        disabled: '=',
        model: '=ngModel',
        config: '=',
        isFieldRequired: '='
      },
      templateUrl: 'widget-container/widget-number/widget-number.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        var defaultValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'default');
        $scope.model = $scope.model || angular.copy(defaultValue);
        $scope.internalModel = $scope.model;
        var minValueFromWidgetJSON = myHelpers.objectQuery($scope.config, 'widget-attributes', 'min');
        var maxValueFromWidgetJSON = myHelpers.objectQuery($scope.config, 'widget-attributes', 'max');
        $scope.showErrorMessage = myHelpers.objectQuery($scope.config, 'widget-attributes', 'showErrorMessage');
        $scope.convertToInteger = myHelpers.objectQuery($scope.config, 'widget-attributes', 'convertToInteger') || false; // The default is to show the message i.e., true
        // We need to explicitly pass a false to hide it.
        // Usually we don't pass this attribute and in that case undefined (or no value) means show the message. Hence the comparison.

        $scope.showErrorMessage = $scope.showErrorMessage === false ? false : true;

        if (typeof minValueFromWidgetJSON === 'number') {
          minValueFromWidgetJSON = minValueFromWidgetJSON.toString();
        }

        if (typeof maxValueFromWidgetJSON === 'number') {
          maxValueFromWidgetJSON = maxValueFromWidgetJSON.toString();
        }

        var checkForBounds = function checkForBounds(newValue) {
          if (!$scope.isFieldRequired && !newValue) {
            $scope.error = '';
            return true;
          }

          if ($scope.disabled) {
            return true;
          }

          if (!newValue) {
            $scope.error = 'Value cannot be empty';

            if (defaultValue) {
              $scope.error += '. Default value: ' + defaultValue;
            }

            return false;
          }

          if (newValue < $scope.min) {
            $scope.error = newValue + ' is less than the minimum: ' + $scope.min;
            return false;
          }

          if (newValue > $scope.max) {
            $scope.error = newValue + ' exceeds the maximum: ' + $scope.max;
            return false;
          }

          $scope.error = '';
        };

        $scope.min = minValueFromWidgetJSON || -Infinity;
        $scope.max = maxValueFromWidgetJSON || Infinity; // The number textbox requires the input to be number.
        // This will be correct for a fresh create studio view. But when the user is trying to import or clone
        // it would be a problem as the imported/cloned plugin property would be a string and number textbox
        // expects a number. Hence this internal state. 'internalModel' is for maintaining the model as number
        // for number textbox and the model is actual model being saved as property value.

        if (typeof $scope.model !== 'number') {
          $scope.internalModel = parseInt($scope.model, 10);
        }

        $scope.$watch('internalModel', function (newValue, oldValue) {
          if (oldValue === newValue || !checkForBounds(newValue)) {
            $scope.model = typeof newValue === 'number' && !Number.isNaN(newValue) && newValue || '';

            if (!$scope.convertToInteger) {
              $scope.model = $scope.model.toString();
            }

            return;
          }

          $scope.model = typeof $scope.internalModel === 'number' && !Number.isNaN($scope.internalModel) && $scope.internalModel || '';

          if (!$scope.convertToInteger && $scope.internalModel) {
            $scope.model = $scope.internalModel.toString();
          }
        }); // This is needed when we hit reset in node configuration.

        $scope.$watch('model', function () {
          $scope.internalModel = parseInt($scope.model, 10);
          checkForBounds($scope.internalModel);
        });
      }]
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
  /* /widget-output-schema/widget-output-schema-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('MyOutputSchemaCtrl', ["$scope", "GLOBALS", "HydratorPlusPlusNodeService", "$timeout", "HydratorPlusPlusHydratorService", function ($scope, GLOBALS, HydratorPlusPlusNodeService, $timeout, HydratorPlusPlusHydratorService) {
    var _this = this;

    var timeout;

    var setEmptyMacro = function setEmptyMacro() {
      _this.outputSchemaString = '${}';
      $timeout.cancel(timeout);
      timeout = $timeout(function () {
        var elem = document.getElementById('macro-input-schema');
        angular.element(elem)[0].focus();

        if (elem.createRange) {
          var range = elem.createRange();
          range.move('character', 2);
          range.select();
        } else {
          elem.setSelectionRange(2, 2);
        }
      });
    };

    this.formatOutputSchema = function () {
      if (!$scope.schemaAdvance) {
        if (typeof $scope.node.outputSchema === 'string') {
          $scope.node.outputSchema = [HydratorPlusPlusNodeService.getOutputSchemaObj($scope.node.outputSchema)];
        }

        _this.outputSchemas = $scope.node.outputSchema.map(function (node) {
          var schema = node.schema;

          if (typeof schema === 'string') {
            try {
              schema = JSON.parse(schema);
            } catch (e) {
              schema = {
                'name': GLOBALS.defaultSchemaName,
                'type': 'record',
                'fields': []
              };
            }
          }

          return {
            name: node.name,
            schema: schema
          };
        });
      } else {
        if ($scope.node.outputSchema.length > 0 && $scope.node.outputSchema[0].schema) {
          var schema = $scope.node.outputSchema[0].schema;

          if (typeof schema !== 'string') {
            schema = JSON.stringify(schema);
          }

          if (!HydratorPlusPlusHydratorService.containsMacro(schema)) {
            setEmptyMacro();
          } else {
            _this.outputSchemaString = schema;
          }
        } else {
          setEmptyMacro();
        }
      }
    };

    this.formatOutputSchema();
    $scope.$watch('schemaAdvance', function () {
      _this.formatOutputSchema();
    });
    $scope.$on('$destroy', function () {
      $timeout.cancel(timeout);
    });

    this.onOutputSchemaChange = function (newValue) {
      $scope.node.outputSchema = newValue;
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
  /* /widget-output-schema/widget-output-schema.js */

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
  angular.module(PKG.name + '.commons').directive('myOutputSchema', function () {
    return {
      restrict: 'EA',
      scope: {
        schemaAdvance: '=',
        node: '=',
        groupsConfig: '=',
        updateDefaultOutputSchema: '&',
        isDisabled: '=',
        errors: '='
      },
      templateUrl: 'widget-container/widget-output-schema/widget-output-schema.html',
      controller: 'MyOutputSchemaCtrl',
      controllerAs: 'MyOutputSchemaCtrl'
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
  /* /widget-password/widget-password.js */

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
  angular.module(PKG.name + '.commons').directive('myPassword', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel'
      },
      templateUrl: 'widget-container/widget-password/widget-password.html',
      controller: ["$scope", function controller($scope) {
        $scope.elementType = 'password';

        $scope.togglePassword = function () {
          $scope.elementType = $scope.elementType === 'text' ? 'password' : 'text';
        };
      }]
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
  /* /widget-rulesengine-editor/rules-engine-modal-ctrl.js */

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
  angular.module(PKG.name + '.commons').controller('RulesEngineModalController', ["rPlugin", "$uibModalInstance", function (rPlugin, $uibModalInstance) {
    var _this = this;

    this.$uibModalInstance = $uibModalInstance;
    this.rulebookid = rPlugin.properties.rulebookid;
    this.node = rPlugin;

    this.onApply = function (rulebook, rulebookid) {
      if (rulebook) {
        _this.node.properties.rulebook = rulebook;
        _this.node.properties.rulebookid = rulebookid;
      }

      _this.$uibModalInstance.close();
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
  /* /widget-rulesengine-editor/widget-rulesengine-editor.js */

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
  angular.module(PKG.name + '.commons').directive('myRulesEngineEditor', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        properties: '='
      },
      templateUrl: 'widget-container/widget-rulesengine-editor/widget-rulesengine-editor.html',
      controller: ["$scope", "$uibModal", function controller($scope, $uibModal) {
        $scope.openRulesEngineModal = function () {
          $uibModal.open({
            controller: 'RulesEngineModalController',
            controllerAs: 'RulesEngineModalCtrl',
            windowClass: 'rules-engine-modal',
            keyboard: false,
            templateUrl: 'widget-container/widget-rulesengine-editor/rules-engine-modal.html',
            resolve: {
              rPlugin: function rPlugin() {
                return {
                  properties: $scope.properties
                };
              }
            }
          });
        };
      }]
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
  /* /widget-radio-group/widget-radio-group.js */

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
  angular.module(PKG.name + '.commons').directive('myRadioGroup', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '='
      },
      templateUrl: 'widget-container/widget-radio-group/widget-radio-group.html',
      controller: ["myHelpers", "$scope", "uuid", function controller(myHelpers, $scope, uuid) {
        $scope.groupName = 'radio-group-' + uuid.v4();
        $scope.options = myHelpers.objectQuery($scope.config, 'widget-attributes', 'options') || [];
        $scope.propertyName = myHelpers.objectQuery($scope.config, 'name');

        if (!Array.isArray($scope.options) || Array.isArray($scope.options) && !$scope.options.length) {
          $scope.error = 'Missing options for ' + $scope.propertyName;
        }

        var defaultValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'default') || '';
        $scope.layout = myHelpers.objectQuery($scope.config, 'widget-attributes', 'layout') || 'block';
        $scope.model = $scope.model || defaultValue;
        var isModelValid = $scope.options.find(function (option) {
          return option.id === $scope.model;
        });

        if (!isModelValid) {
          $scope.error = 'Unknown value for ' + $scope.propertyName + ' specified.';
        }

        $scope.$watch('model', function () {
          var isModelValid = $scope.options.find(function (option) {
            return option.id === $scope.model;
          });

          if (isModelValid) {
            $scope.error = null;
          }
        });
        $scope.options = $scope.options.map(function (option) {
          return {
            id: option.id,
            elementid: $scope.propertyName + '-' + option.id,
            label: option.label || option.id
          };
        });
      }]
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
  /* /widget-schedule/widget-schedule.js */

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
  angular.module(PKG.name + '.commons').directive('mySchedule', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '='
      },
      templateUrl: 'widget-container/widget-schedule/widget-schedule.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        var defaultSchedule = myHelpers.objectQuery($scope.config, 'properties', 'default') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'default') || ['*', '*', '*', '*', '*'];

        function initialize() {
          $scope.schedule = {};

          if (!$scope.model) {
            $scope.schedule.min = defaultSchedule[0];
            $scope.schedule.hour = defaultSchedule[1];
            $scope.schedule.day = defaultSchedule[2];
            $scope.schedule.month = defaultSchedule[3];
            $scope.schedule.week = defaultSchedule[4];
            return;
          }

          var initial = $scope.model.split(' ');
          $scope.schedule.min = initial[0];
          $scope.schedule.hour = initial[1];
          $scope.schedule.day = initial[2];
          $scope.schedule.month = initial[3];
          $scope.schedule.week = initial[4];
        }

        initialize();
        $scope.$watch('schedule', function () {
          var schedule = '';
          angular.forEach($scope.schedule, function (v) {
            schedule += v + ' ';
          });
          schedule = schedule.trim();
          $scope.model = schedule;
        }, true);
      }]
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
  /* /widget-schema-editor/widget-schema-editor.js */

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
  angular.module(PKG.name + '.commons').directive('mySchemaEditor', function () {
    return {
      restrict: 'EA',
      scope: {
        model: '=ngModel',
        config: '=',
        pluginProperties: '=',
        disabled: '='
      },
      templateUrl: 'widget-container/widget-schema-editor/widget-schema-editor.html',
      controller: ["$scope", "myHelpers", "EventPipe", "IMPLICIT_SCHEMA", "HydratorPlusPlusHydratorService", "$timeout", "myAlertOnValium", function controller($scope, myHelpers, EventPipe, IMPLICIT_SCHEMA, HydratorPlusPlusHydratorService, $timeout, myAlertOnValium) {
        $scope.limitedToView = 15;
        var typeMap = 'map<string, string>';
        var defaultOptions = ['boolean', 'int', 'long', 'float', 'double', 'bytes', 'string', 'map<string, string>'];
        var defaultType = null;
        var watchProperty = null;
        var schemaExportTimeout = null;
        var eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
        $scope.fields = 'SHOW';

        if ($scope.config) {
          $scope.options = myHelpers.objectQuery($scope.config, 'widget-attributes', 'schema-types') || myHelpers.objectQuery($scope.config, 'schema-types');
          defaultType = myHelpers.objectQuery($scope.config, 'widget-attributes', 'schema-default-type') || myHelpers.objectQuery($scope.config, 'schema-default-type') || $scope.options[0];
          watchProperty = myHelpers.objectQuery($scope.config, 'property-watch') || myHelpers.objectQuery($scope.config, 'widget-attributes', 'property-watch');

          if (watchProperty) {
            // changing the format when it is stream
            EventPipe.on('dataset.selected', function (schema, format) {
              $scope.pluginProperties[watchProperty] = format;
            });
            $scope.$watch(function () {
              return $scope.pluginProperties[watchProperty];
            }, changeFormat);
          }
        } else {
          $scope.options = defaultOptions;
          defaultType = 'string';
        }

        var watcher;

        function removeWatcher() {
          if (watcher) {
            // deregister watch
            watcher();
            watcher = null;
          }
        }

        function changeFormat() {
          if (!$scope.pluginProperties) {
            return;
          } // watch for changes


          removeWatcher();
          var availableImplicitSchema = Object.keys(IMPLICIT_SCHEMA); // do things based on format

          if (availableImplicitSchema.concat(['']).indexOf($scope.pluginProperties[watchProperty]) > -1) {
            $scope.model = null;
            $scope.disableEdit = true;
            $scope.pluginProperties['format.setting.pattern'] = null;

            if (availableImplicitSchema.indexOf($scope.pluginProperties[watchProperty]) > -1) {
              var implicitSchema = IMPLICIT_SCHEMA[$scope.pluginProperties[watchProperty]];
              initialize(implicitSchema);
            } else {
              $scope.fields = 'NOTHING';
            }
          } else if ($scope.pluginProperties[watchProperty] === 'avro') {
            $scope.disableEdit = false;
            $scope.fields = 'AVRO';
            $scope.pluginProperties['format.setting.pattern'] = null;
            watcher = $scope.$watch('avro', formatAvro, true);

            if ($scope.model) {
              try {
                $scope.avro.schema = JSON.parse($scope.model);
              } catch (e) {
                $scope.error = 'Invalid JSON string';
              }
            }
          } else if ($scope.pluginProperties[watchProperty] === 'grok') {
            $scope.disableEdit = false;
            $scope.fields = 'GROK';
            watcher = $scope.$watch('grok', function () {
              $scope.pluginProperties['format.setting.pattern'] = $scope.grok.pattern;
            }, true);
          } else {
            $scope.disableEdit = false;
            $scope.fields = 'SHOW';
            $scope.pluginProperties['format.setting.pattern'] = null;
            initialize($scope.model);
          }
        }

        var filledCount; // Format model

        function initialize(jsonString) {
          filledCount = 0;
          var schema = {};
          $scope.avro = {};
          $scope.grok = {
            pattern: $scope.pluginProperties['format.setting.pattern']
          };
          $scope.error = null;

          if (jsonString) {
            try {
              schema = JSON.parse(jsonString);
              $scope.avro.schema = schema;
            } catch (e) {
              $scope.error = 'Invalid JSON string';
            }
          }

          schema = myHelpers.objectQuery(schema, 'fields');
          $scope.properties = [];
          $scope.activeCell = false;
          angular.forEach(schema, function (p) {
            if (angular.isArray(p.type)) {
              var mapType = p.type[0];

              if (mapType.type === 'map') {
                mapType = mapType.keys === 'string' && mapType.values === 'string' ? typeMap : null;
              }

              $scope.properties.push({
                name: p.name,
                type: mapType,
                nullable: true,
                readonly: p.readonly
              });
            } else if (angular.isObject(p.type)) {
              if (p.type.type === 'map') {
                $scope.properties.push({
                  name: p.name,
                  type: p.type.keys === 'string' && p.type.values === 'string' ? typeMap : null,
                  nullable: p.nullable,
                  readonly: p.readonly
                });
              } else {
                $scope.properties.push({
                  name: p.name,
                  type: p.type.items,
                  nullable: p.nullable,
                  readonly: p.readonly
                });
              }
            } else {
              $scope.properties.push({
                name: p.name,
                type: p.type,
                nullable: p.nullable,
                readonly: p.readonly
              });
            }
          });
          filledCount = $scope.properties.length; // Note: 15 for now

          if ($scope.properties.length < 15) {
            if ($scope.properties.length === 0) {
              $scope.properties.push({
                name: '',
                type: defaultType,
                nullable: false
              });
              filledCount = 1;
            }

            for (var i = $scope.properties.length; i < 15; i++) {
              $scope.properties.push({
                empty: true
              });
            }
          } else {
            // to add one empty line when there are more than 15 fields
            $scope.properties.push({
              empty: true
            });
          }

          formatSchema();
        } // End of initialize


        if ($scope.config && $scope.config['property-watch']) {
          changeFormat();
        }

        initialize($scope.model);

        function onSchemaClear() {
          var schema;

          try {
            schema = JSON.parse($scope.model);
            schema.fields = schema.fields.filter(function (value) {
              return value.readonly;
            });
            $scope.model = JSON.stringify(schema);
          } catch (e) {
            $scope.model = JSON.stringify({
              fields: []
            });
          }

          initialize($scope.model);
        }

        eventEmitter.on('schema.clear', onSchemaClear);
        EventPipe.on('dataset.selected', function (schema) {
          try {
            var a = JSON.parse($scope.model).fields.filter(function (e) {
              return !e.readonly;
            });

            if (a.length) {
              throw 'Model already set';
            }
          } catch (n) {
            if ($scope.model) {
              return;
            }
          }

          var modSchema = {
            fields: []
          };

          try {
            modSchema.fields = JSON.parse($scope.model).fields.filter(function (field) {
              return field.readonly;
            });
            modSchema.fields = modSchema.fields.concat(JSON.parse(schema).fields);
          } catch (e) {
            modSchema = schema;
          }

          initialize(JSON.stringify(modSchema));
        });

        function formatAvro() {
          if ($scope.pluginProperties[watchProperty] !== 'avro') {
            return;
          }

          var avroJson = JSON.stringify($scope.avro.schema);
          $scope.model = avroJson;
        }

        function formatSchema() {
          $scope.model = HydratorPlusPlusHydratorService.formatOutputSchema($scope.properties);
        } // watch for changes


        $scope.$watch('properties', formatSchema, true);

        $scope.emptyRowClick = function (property, index) {
          if (!property.empty || index !== filledCount || $scope.disabled) {
            return;
          }

          delete property.empty;
          property.name = '';
          property.type = defaultType;
          property.nullable = false;
          property.newField = 'add';
          filledCount++;

          if (filledCount >= 15) {
            $scope.properties.push({
              empty: true
            });
          }
        };

        $scope.addProperties = function () {
          $scope.properties.push({
            name: '',
            type: defaultType,
            nullable: false,
            newField: 'add'
          });
          filledCount++;

          if ($scope.properties.length >= 15) {
            $scope.properties.push({
              empty: true
            });
          }
        };

        $scope.removeProperty = function (property) {
          var index = $scope.properties.indexOf(property);
          $scope.properties.splice(index, 1);

          if ($scope.properties.length <= 15) {
            $scope.properties.push({
              empty: true
            });
          }

          filledCount--;
        };

        $scope.enter = function (event, index) {
          if (index === filledCount - 1 && event.keyCode === 13) {
            if (filledCount < $scope.properties.length) {
              $scope.emptyRowClick($scope.properties[index + 1], index + 1);
            } else {
              $scope.addProperties();
            }
          }
        };

        function exportSchema() {
          if ($scope.url) {
            URL.revokeObjectURL($scope.url);
          }

          var schema = JSON.parse($scope.model);
          schema = schema.fields;
          angular.forEach(schema, function (field) {
            if (field.readonly) {
              delete field.readonly;
            }
          });
          var blob = new Blob([JSON.stringify(schema, null, 4)], {
            type: 'application/json'
          });
          $scope.url = URL.createObjectURL(blob);
          $scope.exportFileName = 'schema';

          if (schemaExportTimeout) {
            $timeout.cancel(schemaExportTimeout);
          }

          schemaExportTimeout = $timeout(function () {
            document.getElementById('schema-export-link').click();
          });
        }

        function onSchemaImport(data) {
          var fields = [];

          try {
            fields = JSON.parse(data);
          } catch (e) {
            myAlertOnValium.show({
              type: 'danger',
              content: 'Error parsing imported schema'
            });
          }

          var schema = {
            fields: fields
          };
          initialize(JSON.stringify(schema));
        }

        eventEmitter.on('schema.export', exportSchema);
        eventEmitter.on('schema.import', onSchemaImport);
        $scope.$on('$destroy', function () {
          eventEmitter.off('schema.import', onSchemaImport);
          eventEmitter.off('schema.clear', onSchemaClear);
          eventEmitter.off('schema.export', exportSchema);
          EventPipe.cancelEvent('dataset.selected');
          URL.revokeObjectURL($scope.url);

          if (schemaExportTimeout) {
            $timeout.cancel(schemaExportTimeout);
          }
        });

        $scope.loadNextSetOfRows = function () {
          $scope.limitedToView = $scope.limitedToView + 10;
        };
      }]
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
  /* /widget-sql-conditions/widget-sql-conditions.js */

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
  function SqlConditionsController() {
    'ngInject';

    var vm = this;
    vm.rules = [];
    vm.mapInputSchema = {};
    vm.stageList = [];
    vm.error = null;
    /**
     * FIXME: CDAP-14999
     * This exists as a stopgap solution when user clicks on generate schema on joiner plugin
     * where the input stages have either & or . or = in their name.
     * The right fix is to fix it in backend.
     */

    vm.checkRulesForValidStageNames = function () {
      var invalidRule = /[&\.=]/g;
      var invalidStageNames = [];
      angular.forEach(vm.rules, function (rule) {
        var invalidStageName = rule.filter(function (field) {
          return invalidRule.test(field.stageName);
        });

        if (invalidStageName.length) {
          invalidStageNames = invalidStageNames.concat(invalidStageName.map(function (stage) {
            return stage.stageName;
          }));
        }
      });

      if (invalidStageNames.length) {
        vm.error = 'Invalid name for input ' + (invalidStageNames.length > 1 ? 'nodes' : 'node') + ': ' + invalidStageNames.map(function (sn) {
          return JSON.stringify(sn);
        }).join(', ') + '. \n Node names cannot contain "&" "=" "."';
      }

      return vm.error && vm.error.length;
    };

    vm.formatOutput = function () {
      vm.checkRulesForValidStageNames();

      if (vm.stageList.length < 2) {
        vm.model = '';
        return;
      }

      var outputArr = [];
      angular.forEach(vm.rules, function (rule) {
        var ruleCheck = rule.filter(function (field) {
          return !field.fieldName;
        });

        if (ruleCheck.length > 0) {
          return;
        }

        var ruleArr = rule.map(function (field) {
          return field.stageName + '.' + field.fieldName;
        });
        var output = ruleArr.join(' = ');
        outputArr.push(output);
      });
      vm.model = outputArr.join(' & ');
    };

    vm.addRule = function () {
      if (vm.stageList.length === 0) {
        return;
      }

      var arr = [];
      angular.forEach(vm.stageList, function (stage) {
        arr.push({
          stageName: stage,
          fieldName: vm.mapInputSchema[stage][0]
        });
      });
      vm.rules.push(arr);
      vm.formatOutput();
    };

    vm.deleteRule = function (index) {
      vm.rules.splice(index, 1);
      vm.formatOutput();
    };

    function initializeOptions() {
      angular.forEach(vm.inputSchema, function (input) {
        vm.stageList.push(input.name);

        try {
          vm.mapInputSchema[input.name] = JSON.parse(input.schema).fields.map(function (field) {
            return field.name;
          });
        } catch (e) {
          console.log('ERROR: ', e);
          vm.error = 'Error parsing input schemas.';
          vm.mapInputSchema[input.name] = [];
        }
      });

      if (vm.stageList.length < 2) {
        vm.error = 'Please connect 2 or more stages.';
      }
    }

    function init() {
      initializeOptions();

      if (!vm.model) {
        vm.addRule();
        return;
      }

      var modelSplit = vm.model.split('&').map(function (rule) {
        return rule.trim();
      });
      angular.forEach(modelSplit, function (rule) {
        var rulesArr = [];
        angular.forEach(rule.split('='), function (field) {
          var splitField = field.trim().split('.'); // Not including rule if stage has been disconnected

          if (vm.stageList.indexOf(splitField[0]) === -1) {
            return;
          }

          rulesArr.push({
            stageName: splitField[0],
            fieldName: splitField[1]
          });
        }); // Missed fields scenario will happen if the user connects more stages into the join node
        // after they have configured join conditions previously

        var missedFields = vm.stageList.filter(function (stage) {
          var filteredRule = rulesArr.filter(function (field) {
            return field.stageName === stage;
          });
          return filteredRule.length === 0 ? true : false;
        });

        if (missedFields.length > 0) {
          angular.forEach(missedFields, function (field) {
            rulesArr.push({
              stageName: field,
              fieldName: vm.mapInputSchema[field][0]
            });
          });
          vm.warning = 'Input stages have changed since the last time you edit this node\'s configuration. Please verify the condition is still valid.';
        }

        vm.rules.push(rulesArr);
      });
      vm.formatOutput();
    }

    init();
  }

  angular.module(PKG.name + '.commons').directive('mySqlConditions', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-sql-conditions/widget-sql-conditions.html',
      bindToController: true,
      scope: {
        model: '=ngModel',
        inputSchema: '=',
        disabled: '='
      },
      controller: SqlConditionsController,
      controllerAs: 'SqlConditions'
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
  /* /widget-sql-select-fields/widget-sql-select-fields.js */

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
  function SqlSelectorController() {
    'ngInject';

    var vm = this;
    vm.expandedButton = true;
    vm.parsedInputSchemas = [];
    vm.aliases = {};
    vm.errors = {
      stageCount: {},
      message: 'Please create one or more aliases for duplicate field names.',
      exist: false
    };
    var modelCopy = angular.copy(vm.model);

    vm.toggleAll = function (expansion) {
      angular.forEach(vm.parsedInputSchemas, function (stage) {
        stage.expanded = expansion;
      });
      vm.expandedButton = !vm.expandedButton;
    };

    vm.resetAll = function () {
      vm.parsedInputSchemas = [];
      init(modelCopy);
    };

    function getStageError() {
      angular.forEach(vm.parsedInputSchemas, function (input) {
        angular.forEach(input.schema, function (field) {
          if (vm.aliases[field.alias] > 1) {
            if (!vm.errors.stageCount[input.name]) {
              vm.errors.stageCount[input.name] = 1;
            } else {
              vm.errors.stageCount[input.name]++;
            }
          }
        });
      });
    }

    vm.formatOutput = function () {
      var outputArr = [];
      vm.errors.stageCount = {};
      vm.errors.exist = false;
      vm.aliases = {};
      angular.forEach(vm.parsedInputSchemas, function (input) {
        angular.forEach(input.schema, function (field) {
          if (!field.selected) {
            return;
          }

          var outputField = input.name + '.' + field.name;

          if (field.alias) {
            outputField += ' as ' + field.alias;
          }

          if (!vm.aliases[field.alias]) {
            vm.aliases[field.alias] = 1;
          } else {
            vm.aliases[field.alias]++;
            vm.errors.exist = true;
          }

          outputArr.push(outputField);
        });
      });
      getStageError();
      vm.model = outputArr.join(',');
    };

    vm.toggleAllFields = function (stage, isSelected) {
      angular.forEach(stage.schema, function (field) {
        field.selected = isSelected;
      });
      vm.formatOutput();
    };

    function init(inputModel) {
      var initialModel = {};

      if (inputModel) {
        var model = inputModel.split(',');
        angular.forEach(model, function (entry) {
          var split = entry.split(' as ');
          var fieldInfo = split[0].split('.');

          if (!initialModel[fieldInfo[0]]) {
            initialModel[fieldInfo[0]] = {};
          }

          initialModel[fieldInfo[0]][fieldInfo[1]] = split[1] ? split[1] : true;
        });
      }

      angular.forEach(vm.inputSchema, function (input) {
        var schema;

        try {
          schema = JSON.parse(input.schema);
        } catch (e) {
          console.log('ERROR: ', e);
          schema = {
            fields: []
          };
        }

        schema = schema.fields.map(function (field) {
          if (initialModel[input.name] && initialModel[input.name][field.name]) {
            field.selected = true;
            field.alias = initialModel[input.name][field.name] === true ? '' : initialModel[input.name][field.name];
          } else {
            field.selected = inputModel ? false : true;
            field.alias = field.name;
          }

          return field;
        });
        vm.parsedInputSchemas.push({
          name: input.name,
          schema: schema,
          expanded: false
        });
      });
      vm.formatOutput();
    }

    init(vm.model);
  }

  angular.module(PKG.name + '.commons').directive('mySqlSelector', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-sql-select-fields/widget-sql-select-fields.html',
      bindToController: true,
      scope: {
        model: '=ngModel',
        inputSchema: '='
      },
      controller: SqlSelectorController,
      controllerAs: 'SqlSelector'
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
  /* /widget-textarea-validate/widget-textarea-validate.js */

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
  TextareaValidateController.$inject = ["$state", "myPipelineApi", "myHelpers"];
  function TextareaValidateController($state, myPipelineApi, myHelpers) {
    var vm = this;
    var methodName = myHelpers.objectQuery(vm.config, 'widget-attributes', 'validate-endpoint');
    vm.placeholder = myHelpers.objectQuery(vm.config, 'widget-attributes', 'placeholder');
    vm.buttonText = myHelpers.objectQuery(vm.config, 'widget-attributes', 'validate-button-text') || 'Validate';
    var successMessage = myHelpers.objectQuery(vm.config, 'widget-attributes', 'validate-success-message') || 'Valid';
    vm.warning = '';
    vm.success = '';

    vm.validate = function () {
      var params = {
        namespace: $state.params.namespace,
        artifactName: vm.node.plugin.artifact.name,
        version: vm.node.plugin.artifact.version,
        pluginType: vm.node.type,
        pluginName: vm.node.plugin.name,
        methodName: methodName,
        scope: vm.node.plugin.artifact.scope
      }; // May need to be more specific to the api method

      myPipelineApi.postPluginMethod(params, vm.node.plugin.properties).$promise.then(function () {
        vm.warning = '';
        vm.success = successMessage;
      }, function (err) {
        vm.warning = err.data || err;
        vm.success = '';
      });
    };
  }

  angular.module(PKG.name + '.commons').directive('myTextareaValidate', function () {
    return {
      restrict: 'E',
      templateUrl: 'widget-container/widget-textarea-validate/widget-textarea-validate.html',
      bindToController: true,
      scope: {
        model: '=ngModel',
        config: '=',
        node: '='
      },
      controller: TextareaValidateController,
      controllerAs: 'TextareaValidate'
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
  /* /widget-toggle-switch/widget-toggle-switch.js */

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
  var CHAR_LIMIT = 64;
  angular.module(PKG.name + '.commons').directive('myToggleSwitch', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        disabled: '='
      },
      templateUrl: 'widget-container/widget-toggle-switch/widget-toggle-switch.html',
      controller: ["$scope", "myHelpers", function controller($scope, myHelpers) {
        var onValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'on', 'value') || 'on';
        var offValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'off', 'value') || 'off';
        var defaultValue = myHelpers.objectQuery($scope.config, 'widget-attributes', 'default') || onValue;
        var onLabel = myHelpers.objectQuery($scope.config, 'widget-attributes', 'on', 'label') || 'On';
        var offLabel = myHelpers.objectQuery($scope.config, 'widget-attributes', 'off', 'label') || 'Off';
        $scope.onLabel = onLabel.slice(0, CHAR_LIMIT);
        $scope.offLabel = offLabel.slice(0, CHAR_LIMIT);
        $scope.model = $scope.model || defaultValue;
        $scope.isOn = $scope.model === onValue;

        $scope.onToggle = function () {
          return $scope.isOn = !$scope.isOn;
        };

        $scope.$watch('isOn', function () {
          $scope.model = $scope.isOn ? onValue : offValue;
        });
      }]
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
  /* /widget-wrangler-directives/widget-wrangler-directives.js */

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
  angular.module(PKG.name + '.commons').directive('myWranglerDirectives', function () {
    return {
      restrict: 'E',
      scope: {
        model: '=ngModel',
        config: '=',
        properties: '=',
        disabled: '='
      },
      templateUrl: 'widget-container/widget-wrangler-directives/widget-wrangler-directives.html',
      controller: ["$scope", "myHelpers", "$uibModal", function controller($scope, myHelpers, $uibModal) {
        $scope.rows = myHelpers.objectQuery($scope, 'config', 'widget-attributes', 'rows');
        $scope.placeholder = myHelpers.objectQuery($scope, 'config', 'widget-attributes', 'placeholder') || '';

        $scope.openWranglerModal = function () {
          if ($scope.disabled) {
            return;
          }

          $uibModal.open({
            controller: 'WranglerModalController',
            controllerAs: 'Wrangler',
            windowClass: 'wrangler-modal',
            keyboard: false,
            templateUrl: '/assets/features/hydrator/templates/create/Wrangler/wrangler-modal.html',
            resolve: {
              rPlugin: function rPlugin() {
                return {
                  properties: $scope.properties
                };
              }
            }
          });
        };
      }]
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
  /* /widget-wrangler-directives/wrangler-modal-ctrl.js */

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
  var WranglerModalController = /*#__PURE__*/function () {
    WranglerModalController.$inject = ["rPlugin", "$uibModalInstance", "$scope", "myHelpers"];
    function WranglerModalController(rPlugin, $uibModalInstance, $scope, myHelpers) {
      _classCallCheck(this, WranglerModalController);

      this.node = rPlugin;
      this.workspaceId = myHelpers.objectQuery(this.node, 'properties', 'workspaceId');
      this.$uibModalInstance = $uibModalInstance;
      this.eventEmitter = window.CaskCommon.ee(window.CaskCommon.ee);
      this.onSubmit = this.onSubmit.bind(this);
      this.modalClosed = false;
      $scope.$on('modal.closing', function (e, reason) {
        if (reason === 'ADD_TO_PIPELINE') {
          return;
        }

        var shouldClose = confirm('Are you sure you want to exit Wrangler?');

        if (!shouldClose) {
          e.preventDefault();
        }
      });
    }

    _createClass(WranglerModalController, [{
      key: "onSubmit",
      value: function onSubmit(_ref) {
        var workspaceId = _ref.workspaceId,
            directives = _ref.directives,
            schema = _ref.schema;

        if (this.modalClosed || !workspaceId) {
          return; // Modal already closed. Nothing to do anymore.
        }

        if (!directives || !schema) {
          this.node.properties.workspaceId = workspaceId;
          this.$uibModalInstance.close('ADD_TO_PIPELINE');
          this.modalClosed = true;
          return;
        }

        this.node.properties.schema = schema;
        this.node.properties.workspaceId = workspaceId;
        this.node.properties.directives = directives.join('\n');
        this.modalClosed = true;
        this.eventEmitter.emit('schema.import', schema);
        this.$uibModalInstance.close('ADD_TO_PIPELINE');
      }
    }, {
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return WranglerModalController;
  }();

  angular.module(PKG.name + '.commons').controller('WranglerModalController', WranglerModalController);
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});
var __signature__ = typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal["default"].signature : function (a) {
  return a;
};

(function (PKG) {
  /* /plugin-functions-factory.js */

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
  angular.module(PKG.name + '.commons').service('PluginsFunctionsFactory', function () {
    this.registry = {
      'getSchema': {
        element: '<get-schema></get-schema>',
        attributes: {
          'node': 'node',
          'fn-config': 'fnConfig',
          'class': 'pull-right'
        }
      },
      'outputSchema': {
        element: '<output-schema></output-schema>',
        attributes: {
          'node': 'node',
          'fn-config': 'fnConfig',
          'node-config': 'nodeConfig',
          'class': 'pull-right'
        }
      },
      'getPropertyValue': {
        element: '<get-property-value></get-property-value>',
        attributes: {
          'node': 'node',
          'fn-config': 'fnConfig',
          'class': 'pull-right'
        }
      },
      'connection-browser': {
        element: '<connections-browser></connections-browser>',
        attributes: {
          'node': 'node',
          'on-browse-complete': 'onComplete',
          'fn-config': 'fnConfig',
          'enable-routing': '"false"'
        }
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
  /* /plugin-functions.js */

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
  angular.module(PKG.name + '.commons').directive('pluginFunctions', ["$compile", "$window", "PluginsFunctionsFactory", function ($compile, $window, PluginsFunctionsFactory) {
    return {
      restrict: 'E',
      scope: {
        fnConfig: '=',
        node: '=',
        nodeConfig: '=',
        isDisabled: '='
      },
      replace: false,
      link: function link(scope, element) {
        if (!scope.fnConfig) {
          return;
        }

        var fn = PluginsFunctionsFactory.registry[scope.fnConfig.widget];

        if (!fn) {
          return;
        }

        var fnElem = angular.element(fn.element);
        /**
         * This function is used when we "browse" connections from within
         * the plugin and update the plugin based on response from
         * wrangler. Ideally we shouldn't overwrite the reference
         * but since its 2-way binding in angular we do it for now.
         * When we migrate to react this should be a proper API call or a context
         * update function.
         */

        scope.onComplete = function (nodeProperties) {
          if (_typeof(scope.node.plugin.properties) === 'object' && Object.keys(scope.node.plugin.properties).length > 1) {
            scope.node.plugin.properties = Object.assign({}, scope.node.plugin.properties, nodeProperties);
            return;
          }

          scope.node.plugin.properties = nodeProperties;
        };

        angular.forEach(fn.attributes, function (value, key) {
          fnElem.attr(key, value);
        });
        element.append(fnElem);
        $compile(element)(scope);
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
  /* /functions/get-property-value/get-property-value.js */

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
  angular.module(PKG.name + '.commons').directive('getPropertyValue', function () {
    return {
      restrict: 'E',
      templateUrl: 'plugin-functions/functions/get-property-value/get-property-value.html',
      scope: {
        node: '=',
        fnConfig: '=',
        nodeConfig: '='
      },
      controller: ["$scope", "$uibModal", "myPipelineApi", "myHelpers", function controller($scope, $uibModal, myPipelineApi, myHelpers) {
        var vm = this;
        var fnConfig = $scope.fnConfig;
        var methodName = fnConfig['plugin-method'] || 'getSchema';
        vm.label = myHelpers.objectQuery(fnConfig, 'widget-attributes', 'label') || 'Get value';
        vm.node = $scope.node;

        var getRequiredFields = function getRequiredFields() {
          if (!fnConfig['required-fields']) {
            return [];
          }

          return fnConfig['required-fields'].map(function (field) {
            if ($scope.node.plugin.properties.hasOwnProperty(field)) {
              return $scope.node.plugin.properties[field];
            }

            return '';
          });
        };

        vm.requiredProperties = getRequiredFields();
        vm.requiredFieldsWatch = $scope.$watch('GetPropertyValueController.node.plugin.properties', function () {
          vm.requiredProperties = getRequiredFields();
        }, true);
        vm.missingFieldsWarningMessage = fnConfig['missing-required-fields-message'] || '';
        var methodType = fnConfig.method || 'GET';

        var getPluginMethodApi = function getPluginMethodApi(methodType) {
          switch (methodType) {
            case 'POST':
              return myPipelineApi.postPluginMethod;

            case 'GET':
              return myPipelineApi.getPluginMethod;

            case 'PUT':
              return myPipelineApi.putPluginMethod;

            case 'DELETE':
              return myPipelineApi.deletePluginMethod;
          }
        };

        var pluginMethodApi = getPluginMethodApi(methodType); // @ts-ignore

        vm.openModal = function () {
          var modal = $uibModal.open({
            templateUrl: 'plugin-functions/functions/get-property-value/get-property-value-modal.html',
            windowClass: 'hydrator-modal layered-modal get-property-value-modal',
            keyboard: true,
            controller: ["$scope", "nodeInfo", "$state", function controller($scope, nodeInfo, $state) {
              var mvm = this;
              mvm.showLoading = true;
              mvm.node = angular.copy(nodeInfo);

              mvm.fetchValue = function () {
                var config = mvm.node.plugin.properties;
                var params = {
                  namespace: $state.params.namespace,
                  artifactName: mvm.node.plugin.artifact.name,
                  version: mvm.node.plugin.artifact.version,
                  pluginType: mvm.node.type,
                  pluginName: mvm.node.plugin.name,
                  methodName: methodName,
                  scope: mvm.node.plugin.artifact.scope
                };
                pluginMethodApi(params, config).$promise.then(function (res) {
                  mvm.error = null;
                  mvm.propertyValue = res;
                  mvm.showLoading = false;
                }, function (err) {
                  mvm.propertyValue = null;
                  mvm.error = err.data;
                  mvm.showLoading = false;
                });
              };

              mvm.apply = function () {
                $scope.$close(JSON.stringify(mvm.propertyValue));
              };

              mvm.fetchValue();
            }],
            controllerAs: 'GetPropertyValueModalController',
            resolve: {
              nodeInfo: function nodeInfo() {
                return $scope.node;
              }
            }
          });
          modal.result.then(function (value) {
            var outputProperty = $scope.nodeConfig.name;
            $scope.node.plugin.properties[outputProperty] = value;
          });
        };
      }],
      controllerAs: 'GetPropertyValueController'
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
  /* /functions/get-schema/get-schema.js */

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
  angular.module(PKG.name + '.commons').directive('getSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'plugin-functions/functions/get-schema/get-schema.html',
      scope: {
        node: '=',
        fnConfig: '='
      },
      controller: ["$scope", "$uibModal", "myPipelineApi", function controller($scope, $uibModal, myPipelineApi) {
        var vm = this;
        var fnConfig = $scope.fnConfig;
        var methodName = fnConfig['plugin-method'] || 'getSchema';
        var methodType = fnConfig.method || 'GET';
        var ee = window.CaskCommon.ee(window.CaskCommon.ee);

        var getPluginMethodApi = function getPluginMethodApi(methodType) {
          switch (methodType) {
            case 'POST':
              return myPipelineApi.postPluginMethod;

            case 'GET':
              return myPipelineApi.getPluginMethod;

            case 'PUT':
              return myPipelineApi.putPluginMethod;

            case 'DELETE':
              return myPipelineApi.deletePluginMethod;
          }
        };

        var pluginMethodApi = getPluginMethodApi(methodType);

        vm.openModal = function () {
          var modal = $uibModal.open({
            templateUrl: 'plugin-functions/functions/get-schema/get-schema-modal.html',
            windowClass: 'hydrator-modal node-config-modal layered-modal get-schema-modal',
            keyboard: true,
            controller: ["$scope", "nodeInfo", "$state", function controller($scope, nodeInfo, $state) {
              var mvm = this;
              mvm.node = angular.copy(nodeInfo);
              mvm.query = mvm.node.plugin.properties.importQuery;

              mvm.fetchSchema = function () {
                var config = mvm.node.plugin.properties;
                config.query = mvm.query;
                delete config.importQuery;
                var params = {
                  namespace: $state.params.namespace,
                  artifactName: mvm.node.plugin.artifact.name,
                  version: mvm.node.plugin.artifact.version,
                  pluginType: mvm.node.type,
                  pluginName: mvm.node.plugin.name,
                  methodName: methodName,
                  scope: mvm.node.plugin.artifact.scope
                };
                pluginMethodApi(params, config).$promise.then(function (res) {
                  mvm.error = null;
                  mvm.schema = res;
                }, function (err) {
                  mvm.schema = null;
                  mvm.error = err.data;
                });
              };

              mvm.apply = function () {
                $scope.$close({
                  schema: mvm.schema,
                  query: mvm.query
                });
              };
            }],
            controllerAs: 'GetSchemaModalController',
            resolve: {
              nodeInfo: function nodeInfo() {
                return $scope.node;
              }
            }
          });
          modal.result.then(function (obj) {
            ee.emit('schema.import', JSON.stringify(obj.schema));
            $scope.node.plugin.properties.importQuery = obj.query;
          });
        };
      }],
      controllerAs: 'GetSchemaController'
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
  /* /functions/output-schema/output-schema.js */

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
  angular.module(PKG.name + '.commons').directive('outputSchema', function () {
    return {
      restrict: 'E',
      templateUrl: 'plugin-functions/functions/output-schema/output-schema.html',
      scope: {
        node: '=',
        fnConfig: '=',
        nodeConfig: '='
      },
      controller: ["$scope", "$uibModal", "EventPipe", "myPipelineApi", "myHelpers", function controller($scope, $uibModal, EventPipe, myPipelineApi, myHelpers) {
        var vm = this;
        var fnConfig = $scope.fnConfig;
        vm.label = fnConfig['label'] || 'Get Schema';
        vm.btnClass = fnConfig['button-class'] || 'btn-default';
        var omitProperties = myHelpers.objectQuery($scope.fnConfig, 'omit-properties') || [];
        var addProperties = myHelpers.objectQuery($scope.fnConfig, 'add-properties') || [];
        vm.node = $scope.node;

        var getRequiredFields = function getRequiredFields() {
          if (!fnConfig['required-fields']) {
            return [];
          }

          return fnConfig['required-fields'].map(function (field) {
            if ($scope.node.plugin.properties.hasOwnProperty(field)) {
              return $scope.node.plugin.properties[field];
            }

            return '';
          });
        };

        vm.requiredProperties = getRequiredFields();
        vm.requiredFieldsWatch = $scope.$watch('OutputSchemaController.node.plugin.properties', function () {
          vm.requiredProperties = getRequiredFields();
        }, true);
        vm.missingFieldsWarningMessage = fnConfig['missing-required-fields-message'] || '';

        vm.openModal = function () {
          var modal = $uibModal.open({
            templateUrl: 'plugin-functions/functions/output-schema/output-schema-modal.html',
            windowClass: 'hydrator-modal node-config-modal layered-modal output-schema-modal',
            keyboard: true,
            controller: ["$scope", "nodeInfo", "$state", "HydratorPlusPlusNodeService", function controller($scope, nodeInfo, $state, HydratorPlusPlusNodeService) {
              var mvm = this;
              mvm.additionalPropertiesFields = addProperties;
              mvm.additionalProperties = {};

              if (Array.isArray(mvm.additionalPropertiesFields)) {
                mvm.additionalPropertiesFields.forEach(function (additionalProperty) {
                  var pluginProperty = additionalProperty['plugin-property-for-value'];

                  if (pluginProperty) {
                    mvm.additionalProperties[additionalProperty.name] = nodeInfo.plugin.properties[pluginProperty];
                  }
                });
              }

              var parseResSchema = function parseResSchema(res) {
                if (res.name && res.type && res.fields) {
                  return [HydratorPlusPlusNodeService.getOutputSchemaObj(res)];
                }

                var schemaArr = [];
                angular.forEach(res, function (value, key) {
                  if (value.name && value.type && value.fields) {
                    schemaArr.push(HydratorPlusPlusNodeService.getOutputSchemaObj(value, key));
                  }
                });
                var recordSchemas = schemaArr.filter(function (schema) {
                  return schema.name.substring(0, 6) === 'record';
                });

                var schemaArrWithoutRecordSchemas = _.difference(schemaArr, recordSchemas);

                var schemaArrWithSortedRecordSchemas = schemaArrWithoutRecordSchemas.concat(_.sortBy(recordSchemas, 'name'));
                return schemaArrWithSortedRecordSchemas;
              };

              mvm.stageErrors = [];

              mvm.makeRequest = function () {
                mvm.showLoading = true;
                var params = {
                  context: $state.params.namespace
                };
                var pluginInfo = angular.copy(nodeInfo.plugin);
                pluginInfo.type = nodeInfo.type;
                omitProperties.forEach(function (property) {
                  delete pluginInfo.properties[property.name];
                });
                pluginInfo.properties = angular.extend({}, pluginInfo.properties, mvm.additionalProperties);
                var schemaParseError = null;
                var requestBody = {
                  stage: {
                    name: nodeInfo.name,
                    plugin: pluginInfo
                  },
                  inputSchemas: !nodeInfo.inputSchema ? [] : nodeInfo.inputSchema.map(function (input) {
                    var schema;

                    try {
                      schema = JSON.parse(input.schema);
                    } catch (e) {
                      schemaParseError = e;
                    }

                    return {
                      stage: input.name,
                      schema: schema
                    };
                  })
                };

                if (schemaParseError) {
                  mvm.error = schemaParseError;
                  return;
                }

                myPipelineApi.validateStage(params, requestBody).$promise.then(function (res) {
                  if (res.errors.length > 0) {
                    mvm.stageErrors = res.errors.map(function (err) {
                      return err.message;
                    });
                  } else {
                    var outputSchema = myHelpers.objectQuery(res, 'spec', 'outputSchema');
                    var portSchemas = myHelpers.objectQuery(res, 'spec', 'portSchemas');

                    if (!outputSchema && !portSchemas) {
                      mvm.error = 'There is no output schema.';
                      return;
                    }

                    mvm.schemas = parseResSchema(outputSchema || portSchemas);
                  }

                  mvm.showLoading = false;
                  mvm.error = null;
                }, function (err) {
                  mvm.showLoading = false;
                  mvm.schemas = null;
                  mvm.error = err.data;
                });
              };

              if (addProperties.length === 0) {
                mvm.makeRequest();
              }

              mvm.apply = function () {
                mvm.schemas = mvm.schemas.map(function (schema) {
                  return {
                    name: schema.name,
                    schema: JSON.stringify(schema.schema)
                  };
                });
                $scope.$close({
                  schemas: mvm.schemas
                });
              };
            }],
            controllerAs: 'GetSchemaModalController',
            resolve: {
              nodeInfo: function nodeInfo() {
                return $scope.node;
              }
            }
          });
          modal.result.then(function (obj) {
            var ee = window.CaskCommon.ee(window.CaskCommon.ee);
            ee.emit('schema.import', obj.schemas);
          });
        };

        $scope.$on('$destroy', function () {
          vm.requiredFieldsWatch();
        });
      }],
      controllerAs: 'OutputSchemaController'
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
  /* /my-link-button.js */

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
  var MyLinkButtonCtrl = /*#__PURE__*/function () {
    MyLinkButtonCtrl.$inject = ["$stateParams"];
    function MyLinkButtonCtrl($stateParams) {
      var _this = this;

      _classCallCheck(this, MyLinkButtonCtrl);

      var pipelineDetailStoreState = window.CaskCommon.PipelineDetailStore.getState();
      var currentRun = pipelineDetailStoreState.currentRun;
      this.disabled = !currentRun;
      this.entities.forEach(function (entity) {
        var datasetId = entity.datasetId;

        if (datasetId.indexOf('${') !== -1 && !_this.disabled) {
          var runtimeargs;

          try {
            runtimeargs = JSON.parse(currentRun.properties.runtimeArgs);
          } catch (e) {
            console.log('Unable to parse runtime args to resolve macros.');
            _this.disabled = true;
            return;
          }
          /**
           * FIXME: This DOES NOT consider cases where we have nested macros.
           * Not clear even if we have nested macros how to resolve them to a single dataset
           * in UI. For now the assumption it will always be ${macroname}.
           */


          var macroName = datasetId.substring(datasetId.lastIndexOf('${') + 2, datasetId.lastIndexOf('}'));
          datasetId = runtimeargs[macroName];
        }

        var stateParams = {
          namespace: $stateParams.namespace,
          entityType: entity.entityType,
          entityId: datasetId
        };
        entity.url = window.getTrackerUrl({
          stateParams: stateParams,
          stateName: 'tracker.detail.entity.summary'
        });
      });
    }

    _createClass(MyLinkButtonCtrl, [{
      key: "__reactstandin__regenerateByEval",
      value: // @ts-ignore
      function __reactstandin__regenerateByEval(key, code) {
        // @ts-ignore
        this[key] = eval(code);
      }
    }]);

    return MyLinkButtonCtrl;
  }();

  MyLinkButtonCtrl.$inject = ['$stateParams'];
  angular.module(PKG.name + '.commons').directive('myLinkButton', function () {
    return {
      restrict: 'E',
      scope: {
        entities: '=',
        currentRun: '='
      },
      bindToController: true,
      controller: MyLinkButtonCtrl,
      controllerAs: 'MyLinkButtonCtrl',
      templateUrl: 'my-link-button/my-link-button.html'
    };
  });
})({
  "name": "cdap-ui",
  "v": "6.2.0"
});