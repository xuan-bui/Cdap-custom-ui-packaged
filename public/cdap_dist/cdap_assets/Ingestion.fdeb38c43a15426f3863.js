(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{1668:function(e,t,n){"use strict";var r,a=n(0),i=n(13),o=n.n(i),s=n(278),c=n(283),l=n.n(c),p=n(1748),u=n.n(p),d=n(1747),f=n.n(d),m=(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),g=function(e){function t(t){var n=e.call(this,t)||this;return n.isScrollable=function(){return!(!n.carouselRef||!n.carouselRef.current)&&n.carouselRef.current.scrollWidth>n.carouselRef.current.clientWidth},n.leftDisabled=function(){return!n.isScrollable()||0===n.carouselRef.current.scrollLeft},n.rightDisabled=function(){if(!n.isScrollable())return!0;var e=n.carouselRef.current;return e.scrollLeft+e.clientWidth>=e.scrollWidth},n.setArrowDisabled=function(){var e=n.leftDisabled(),t=n.rightDisabled();n.state.leftDisabled===e&&n.state.rightDisabled===t||n.setState({leftDisabled:e,rightDisabled:t})},n.state={leftDisabled:n.leftDisabled(),rightDisabled:n.rightDisabled()},n.throttledSetArrowDisabled=f()(n.setArrowDisabled,300,{trailing:!0,leading:!0}),n.scrollRight=function(){n.carouselRef.current.scrollLeft+=n.props.scrollAmount},n.scrollLeft=function(){n.carouselRef.current.scrollLeft-=n.props.scrollAmount},n.carouselRef=a.createRef(),n}return m(t,e),t.prototype.componentDidMount=function(){this.carouselRef.current.addEventListener("scroll",this.throttledSetArrowDisabled),window.addEventListener("resize",this.throttledSetArrowDisabled)},t.prototype.componentDidUpdate=function(){this.setArrowDisabled()},t.prototype.componentWillUnmount=function(){this.throttledSetArrowDisabled.cancel(),window.removeEventListener("resize",this.throttledSetArrowDisabled)},t.prototype.render=function(){var e=this.props.classes;return a.createElement("div",{className:e.root},a.createElement("div",{className:e.arrowsContainer},a.createElement(s.a,{size:"small",className:e.arrow+" "+e.back,onClick:this.scrollLeft,disabled:this.state.leftDisabled},a.createElement(u.a,{className:e.icon})),a.createElement(s.a,{size:"small",className:e.arrow+" "+e.forward,onClick:this.scrollRight,disabled:this.state.rightDisabled},a.createElement(l.a,{className:e.icon}))),a.createElement("div",{className:e.contentContainer,ref:this.carouselRef},this.props.children))},t}(a.PureComponent),E=o()((function(){return{contentContainer:{paddingLeft:"60px",paddingRight:"60px",whiteSpace:"nowrap",overflowX:"scroll",scrollSnapType:"x proximity",scrollPadding:"60px",display:"flex",scrollBehavior:"smooth","-ms-overflow-style":"none","&::-webkit-scrollbar":{display:"none"},"&:after":{content:'""',borderLeft:"30px solid transparent"},"& > *":{scrollSnapAlign:"end"}},arrowsContainer:{position:"relative",height:0,width:"100%"},arrow:{position:"absolute",top:"50px",transform:"translateY(-50%)","&:focus":{outline:0}},back:{left:0},forward:{right:0},icon:{fontSize:"45px"}}}))(g);t.a=E},1747:function(e,t,n){var r=n(134),a=n(86);e.exports=function(e,t,n){var i=!0,o=!0;if("function"!=typeof e)throw new TypeError("Expected a function");return a(n)&&(i="leading"in n?!!n.leading:i,o="trailing"in n?!!n.trailing:o),r(e,t,{leading:i,maxWait:t,trailing:o})}},1748:function(e,t,n){"use strict";var r=n(72),a=n(73);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=a(n(0)),o=(0,r(n(74)).default)(i.createElement("path",{d:"M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"}),"KeyboardArrowLeft");t.default=o},1750:function(e,t,n){var r=n(1751)();e.exports=r},1751:function(e,t,n){var r=n(1752),a=n(521),i=n(1753);e.exports=function(e){return function(t,n,o){return o&&"number"!=typeof o&&a(t,n,o)&&(n=o=void 0),t=i(t),void 0===n?(n=t,t=0):n=i(n),o=void 0===o?t<n?1:-1:i(o),r(t,n,o,e)}}},1752:function(e,t){var n=Math.ceil,r=Math.max;e.exports=function(e,t,a,i){for(var o=-1,s=r(n((t-e)/(a||1)),0),c=Array(s);s--;)c[i?s:++o]=e,e+=a;return c}},1753:function(e,t,n){var r=n(519);e.exports=function(e){return e?(e=r(e))===1/0||e===-1/0?17976931348623157e292*(e<0?-1:1):e==e?e:0:0===e?e:0}},1776:function(e,t,n){"use strict";var r=n(3),a=n(33),i=n(27),o=n(1750),s=n.n(o),c=n(91),l=n(158),p=n(22),u=n.n(p),d=n(121),f=n.n(d),m="system.spark.spark.executor.instances",g="spark.dynamicAllocation.enabled",E="mapreduce",h=n(24);function S(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function b(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?S(Object(n),!0).forEach((function(t){y(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):S(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function y(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}n.d(t,"a",(function(){return v}));var v={INITIALIZE_CONFIG:"INITIALIZE_CONFIG",SET_RUNTIME_ARGS:"SET_RUNTIME_ARGS",SET_RESOLVED_MACROS:"SET_RESOLVED_MACROS",RESET_RUNTIME_ARG_TO_RESOLVED_VALUE:"RESET_RUNTIME_ARG_TO_RESOLVED_VALUE",SET_ENGINE:"SET_ENGINE",SET_BATCH_INTERVAL_RANGE:"SET_BATCH_INTERVAL_RANGE",SET_BATCH_INTERVAL_UNIT:"SET_BATCH_INTERVAL_UNIT",SET_MEMORY_MB:"SET_MEMORY_MB",SET_MEMORY_VIRTUAL_CORES:"SET_MEMORY_VIRTUAL_CORES",SET_DRIVER_MEMORY_MB:"SET_DRIVER_MEMORY_MB",SET_DRIVER_VIRTUAL_CORES:"SET_DRIVER_VIRTUAL_CORES",SET_CLIENT_MEMORY_MB:"SET_CLIENT_MEMORY_MB",SET_CLIENT_VIRTUAL_CORES:"SET_CLIENT_VIRTUAL_CORES",SET_BACKPRESSURE:"SET_BACKPRESSURE",SET_CUSTOM_CONFIG:"SET_CUSTOM_CONFIG",SET_CUSTOM_CONFIG_KEY_VALUE_PAIRS:"SET_CUSTOM_CONFIG_KEY_VALUE_PAIRS",SET_NUM_EXECUTORS:"SET_NUM_EXECUTORS",SET_INSTRUMENTATION:"SET_INSTRUMENTATION",SET_STAGE_LOGGING:"SET_STAGE_LOGGING",SET_CHECKPOINTING:"SET_CHECKPOINTING",SET_CHECKPOINT_DIR:"SET_CHECKPOINT_DIR",SET_NUM_RECORDS_PREVIEW:"SET_NUM_RECORDS_PREVIEW",SET_MODELESS_OPEN_STATUS:"SET_MODELESS_OPEN_STATUS",SET_PIPELINE_VISUAL_CONFIGURATION:"SET_PIPELINE_VISUAL_CONFIGURATION",SET_SERVICE_ACCOUNT_PATH:"SET_SERVICE_ACCOUNT_PATH",SET_PUSHDOWN_CONFIG:"SET_PUSHDOWN_CONFIG",RESET:"RESET",SET_DYNAMIC_EXECUTION:"SET_DYNAMIC_EXECUTION"},_=(s()(1,61),s()(1,11),{pairs:[Object(l.b)()]}),C={runtimeArgs:f()(_),resolvedMacros:{},customConfigKeyValuePairs:f()(_),postRunActions:[],properties:{},engine:i.c.engine,resources:b({},i.c.resources),driverResources:b({},i.c.resources),clientResources:b({},i.c.resources),processTimingEnabled:i.c.processTimingEnabled,stageLoggingEnabled:i.c.stageLoggingEnabled,disableCheckpoints:i.c.disableCheckpoints,checkpointDir:window.CDAP_CONFIG.hydrator.defaultCheckpointDir,stopGracefully:i.c.stopGracefully,backpressure:i.c.backpressure,numExecutors:i.c.numExecutors,numOfRecordsPreview:i.c.numOfRecordsPreview,previewTimeoutInMin:i.c.previewTimeoutInMin,batchInterval:i.c.batchInterval,postActions:[],schedule:i.c.schedule,maxConcurrentRuns:1,isMissingKeyValues:!1,modelessOpen:!1,pipelineVisualConfiguration:{pipelineType:i.b.etlDataPipeline,isHistoricalRun:!1,isPreview:!1,isDetailView:!1}},T=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0,n=[];i.b.etlRealtime===t?n=["system.spark.spark.streaming.backpressure.enabled",m]:h.a.allowForceDynamicExecution&&Object.prototype.hasOwnProperty.call(e,g)&&("true"===e[g]?n=[g,"spark.dynamicAllocation.shuffleTracking.enabled"]:"false"===e[g]&&(n=[g,m]));var r={};return Object.keys(e).forEach((function(t){-1===n.indexOf(t)&&(r[t]=e[t])})),r},O=function(e,t,n){var r=T(e,n),a={};for(var i in r)if(Object.prototype.hasOwnProperty.call(r,i)){var o=i;"mapreduce"===t&&i.startsWith("system.mapreduce.")?o=o.slice("system.mapreduce.".length):i.startsWith("system.spark.")&&(o=o.slice("system.spark.".length)),a[o]=r[i]}return Object(c.b)(a)},N=function(e,t){return e.pairs.forEach((function(e){if(e.notDeletable)if(e.provided)e.showReset=!1;else{var n=e.key;Object.prototype.hasOwnProperty.call(t,n)&&(t[n]!==e.value?e.showReset=!0:e.showReset=!1)}})),w(e,t)},I=function(e,t,n){var r=t.pairs[e].key;return t.pairs[e].value=n[r],t},w=function(e,t){var n={},r={};e.pairs&&(e.pairs.forEach((function(e){var t=e.key;r[t]=e.value||"",e.notDeletable&&e.provided&&(n[t]=e.value)})),e.pairs=e.pairs.filter((function(e){return-1===Object.keys(t).indexOf(e.key)})));var a=Object.keys(t).map((function(e){return{key:e,value:r[e]||"",showReset:t[e].showReset,uniqueId:"id-"+u()(),notDeletable:!0,provided:Object.prototype.hasOwnProperty.call(n,e)}}));return e.pairs=a.concat(e.pairs),e},R=function(e,t){return Object(c.d)(e)||Object(c.d)(t)},x=Object(a.createStore)((function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:C,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:r.m;switch(t.type){case v.INITIALIZE_CONFIG:return b({},e,{},t.payload,{customConfigKeyValuePairs:O(t.payload.properties,t.payload.engine,e.pipelineVisualConfiguration.pipelineType)});case v.SET_RUNTIME_ARGS:return b({},e,{runtimeArgs:N(t.payload.runtimeArgs,e.resolvedMacros),isMissingKeyValues:R(t.payload.runtimeArgs,e.customConfigKeyValuePairs)});case v.SET_RESOLVED_MACROS:var n=t.payload.resolvedMacros,a=w(f()(e.runtimeArgs),n),o=R(a,e.customConfigKeyValuePairs);return b({},e,{resolvedMacros:n,runtimeArgs:a,isMissingKeyValues:o});case v.RESET_RUNTIME_ARG_TO_RESOLVED_VALUE:return b({},e,{runtimeArgs:I(t.payload.index,b({},e.runtimeArgs),e.resolvedMacros)});case v.SET_ENGINE:return b({},e,{engine:t.payload.engine});case v.SET_BATCH_INTERVAL_RANGE:return b({},e,{batchInterval:t.payload.batchIntervalRange+e.batchInterval.slice(-1)});case v.SET_BATCH_INTERVAL_UNIT:return b({},e,{batchInterval:e.batchInterval.slice(0,-1)+t.payload.batchIntervalUnit});case v.SET_MEMORY_MB:return b({},e,{resources:b({},e.resources,{memoryMB:t.payload.memoryMB})});case v.SET_MEMORY_VIRTUAL_CORES:return b({},e,{resources:b({},e.resources,{virtualCores:t.payload.virtualCores})});case v.SET_DRIVER_MEMORY_MB:return b({},e,{driverResources:b({},e.driverResources,{memoryMB:t.payload.memoryMB})});case v.SET_DRIVER_VIRTUAL_CORES:return b({},e,{driverResources:b({},e.driverResources,{virtualCores:t.payload.virtualCores})});case v.SET_CLIENT_MEMORY_MB:return b({},e,{clientResources:b({},e.clientResources,{memoryMB:t.payload.memoryMB})});case v.SET_CLIENT_VIRTUAL_CORES:return b({},e,{clientResources:b({},e.clientResources,{virtualCores:t.payload.virtualCores})});case v.SET_BACKPRESSURE:return b({},e,{properties:b({},e.properties,{"system.spark.spark.streaming.backpressure.enabled":t.payload.backpressure})});case v.SET_CUSTOM_CONFIG_KEY_VALUE_PAIRS:return b({},e,{customConfigKeyValuePairs:t.payload.keyValues,isMissingKeyValues:R(e.runtimeArgs,t.payload.keyValues)});case v.SET_CUSTOM_CONFIG:var s=b({},e.properties),c=T(s);Object.keys(c).forEach((function(e){Object.prototype.hasOwnProperty.call(s,e)&&delete s[e]}));var l={};return Object.keys(t.payload.customConfig).forEach((function(n){var r=t.payload.customConfig[n];n=i.b.etlBatchPipelines.includes(t.payload.pipelineType)&&e.engine===E?"system.mapreduce."+n:"system.spark."+n,l[n]=r})),b({},e,{properties:b({},s,{},l)});case v.SET_NUM_EXECUTORS:var p=t.payload.numExecutors;return b({},e,{properties:b({},e.properties,y({},m,p))});case v.SET_INSTRUMENTATION:return b({},e,{processTimingEnabled:t.payload.instrumentation});case v.SET_STAGE_LOGGING:return b({},e,{stageLoggingEnabled:t.payload.stageLogging});case v.SET_CHECKPOINTING:return b({},e,{disableCheckpoints:t.payload.disableCheckpoints});case v.SET_CHECKPOINT_DIR:return b({},e,{checkpointDir:t.payload.checkpointDir});case v.SET_NUM_RECORDS_PREVIEW:return b({},e,{numOfRecordsPreview:t.payload.numRecordsPreview});case v.SET_MODELESS_OPEN_STATUS:return b({},e,{modelessOpen:t.payload.open});case v.SET_SERVICE_ACCOUNT_PATH:return b({},e,{serviceAccountPath:t.payload.serviceAccountPath});case v.SET_PUSHDOWN_CONFIG:return b({},e,{transformationPushdown:t.payload.transformationPushdown,pushdownEnabled:t.payload.pushdownEnabled});case v.RESET:return f()(C);case v.SET_PIPELINE_VISUAL_CONFIGURATION:return b({},e,{pipelineVisualConfiguration:b({},e.pipelineVisualConfiguration,{},t.payload.pipelineVisualConfiguration)});case v.SET_DYNAMIC_EXECUTION:return t.payload.value===i.b.dynamicExecutionForceOn?b({},e,{properties:b({},e.properties,{SPARK_DYNAMIC_ALLOCATION:!0,SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING:!0,SPARK_EXECUTOR_INSTANCES:void 0})}):t.payload.value===i.b.dynamicExecutionForceOff?b({},e,{properties:b({},e.properties,{SPARK_DYNAMIC_ALLOCATION:!1,SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING:void 0})}):b({},e,{dynamicExecution:void 0,properties:b({},e.properties,{SPARK_DYNAMIC_ALLOCATION:void 0,SPARK_DYNAMIC_ALLOCATION_SHUFFLE_TRACKING:void 0,SPARK_EXECUTOR_INSTANCES:void 0})});default:return e}}),f()(C),Object(r.h)("PipelineConfigurationsStore")());t.b=x},2395:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n(13),i=n.n(a),o=n(197),s=n(5),c=n(11),l=(n(1),n(10)),p=n(308),u=n(20),d=r.forwardRef((function(e,t){var n=e.classes,a=e.className,i=e.raised,o=void 0!==i&&i,u=Object(c.a)(e,["classes","className","raised"]);return r.createElement(p.a,Object(s.a)({className:Object(l.a)(n.root,a),elevation:o?8:1,ref:t},u))})),f=Object(u.a)({root:{overflow:"hidden"}},{name:"MuiCard"})(d),m=n(3),g=n(1525),E=n(12);function h(e){var t={script:"icon-script",scriptfilter:"icon-scriptfilter",twitter:"icon-twitter",cube:"icon-cube",data:"fa-database",database:"icon-database",table:"icon-table",kafka:"icon-kafka",jms:"icon-jms",projection:"icon-projection",amazonsqs:"icon-amazonsqs",datagenerator:"icon-datagenerator",validator:"icon-validator",corevalidator:"corevalidator",logparser:"icon-logparser",file:"icon-file",kvtable:"icon-kvtable",s3:"icon-s3",s3avro:"icon-s3avro",s3parquet:"icon-s3parquet",snapshotavro:"icon-snapshotavro",snapshotparquet:"icon-snapshotparquet",tpfsavro:"icon-tpfsavro",tpfsparquet:"icon-tpfsparquet",sink:"icon-sink",hive:"icon-hive",structuredrecordtogenericrecord:"icon-structuredrecord",cassandra:"icon-cassandra",teradata:"icon-teradata",elasticsearch:"icon-elasticsearch",hbase:"icon-hbase",mongodb:"icon-mongodb",pythonevaluator:"icon-pythonevaluator",csvformatter:"icon-csvformatter",csvparser:"icon-csvparser",clonerecord:"icon-clonerecord",compressor:"icon-compressor",decompressor:"icon-decompressor",encoder:"icon-encoder",decoder:"icon-decoder",jsonformatter:"icon-jsonformatter",jsonparser:"icon-jsonparser",hdfs:"icon-hdfs",hasher:"icon-hasher",javascript:"icon-javascript",deduper:"icon-deduper",distinct:"icon-distinct",naivebayestrainer:"icon-naivebayestrainer",groupbyaggregate:"icon-groupbyaggregate",naivebayesclassifier:"icon-naivebayesclassifier",azureblobstore:"icon-azureblobstore",xmlreader:"icon-XMLreader",xmlparser:"icon-XMLparser",ftp:"icon-FTP",joiner:"icon-joiner",deduplicate:"icon-deduplicator",valuemapper:"icon-valuemapper",rowdenormalizer:"icon-rowdenormalizer",ssh:"icon-ssh",sshaction:"icon-sshaction",copybookreader:"icon-COBOLcopybookreader",excel:"icon-excelinputsource",encryptor:"icon-Encryptor",decryptor:"icon-Decryptor",hdfsfilemoveaction:"icon-filemoveaction",hdfsfilecopyaction:"icon-filecopyaction",sqlaction:"icon-SQLaction",impalahiveaction:"icon-impalahiveaction",email:"icon-emailaction",kinesissink:"icon-Amazon-Kinesis",bigquerysource:"icon-Big-Query",tpfsorc:"icon-ORC",groupby:"icon-groupby",sparkmachinelearning:"icon-sparkmachinelearning",solrsearch:"icon-solr",sparkstreaming:"icon-sparkstreaming",rename:"icon-rename",archive:"icon-archive",wrangler:"icon-DataPreparation",normalize:"icon-normalize",xmlmultiparser:"icon-XMLmultiparser",xmltojson:"icon-XMLtoJSON",decisiontreepredictor:"icon-decisiontreeanalytics",decisiontreetrainer:"icon-DesicionTree",hashingtffeaturegenerator:"icon-HashingTF",ngramtransform:"icon-NGram",tokenizer:"icon-tokenizeranalytics",skipgramfeaturegenerator:"icon-skipgram",skipgramtrainer:"icon-skipgramtrainer",logisticregressionclassifier:"icon-logisticregressionanalytics",logisticregressiontrainer:"icon-LogisticRegressionclassifier",hdfsdelete:"icon-hdfsdelete",hdfsmove:"icon-hdfsmove",windowssharecopy:"icon-windowssharecopy",httppoller:"icon-httppoller",window:"icon-window",run:"icon-Run",oracleexport:"icon-OracleDump",snapshottext:"icon-SnapshotTextSink",errorcollector:"fa-exclamation-triangle",mainframereader:"icon-MainframeReader",fastfilter:"icon-fastfilter",trash:"icon-TrashSink",staterestore:"icon-Staterestore",topn:"icon-TopN",wordcount:"icon-WordCount",datetransform:"icon-DateTransform",sftpcopy:"icon-FTPcopy",sftpdelete:"icon-FTPdelete",validatingxmlconverter:"icon-XMLvalidator",wholefilereader:"icon-Filereader",xmlschemaaction:"icon-XMLschemagenerator",s3toredshift:"icon-S3toredshift",redshifttos3:"icon-redshifttoS3",verticabulkexportaction:"icon-Verticabulkexport",verticabulkimportaction:"icon-Verticabulkload",loadtosnowflake:"icon-snowflake",kudu:"icon-apachekudu",orientdb:"icon-OrientDB",recordsplitter:"icon-recordsplitter",scalasparkprogram:"icon-spark",scalasparkcompute:"icon-spark",cdcdatabase:"icon-database",cdchbase:"icon-hbase",cdckudu:"icon-apachekudu",changetrackingsqlserver:"icon-database",conditional:"fa-question-circle-o"},n=e?e.toLowerCase():"";return t[n]?t[n]:"fa-plug"}function S(e){var t=Object(m.E)(e,"widgetJson","display-name"),n=Object(m.E)(e,"name")||"";return t||n}var b=n(1668),y=i()((function(e){return{root:{display:"flex",flexDirection:"column",alignItems:"center",backgroundColor:e.palette.grey[700],padding:"20px",width:"95vw"},pluginsRow:{width:"100%"},title:{display:"flex",alignItems:"center"},pluginCard:{display:"flex",flexDirection:"column",flexShrink:0,margin:"10px",alignItems:"center",width:"175px",height:"120px",cursor:"pointer",justifyContent:"space-around"},pluginImageContainer:{display:"flex",alignItems:"center",marginTop:"10px"},pluginIcon:{width:"50px",height:"auto"},pluginFAIcon:{fontSize:"32px"},cardTitle:{padding:"15px"},cardButtonsContainer:{display:"flex",width:"100%",justifyContent:"center"},targetsButton:{}}}))((function(e){var t=e.classes,n=e.plugins,a=e.onPluginSelect;return r.createElement("div",{className:t.root},r.createElement("h6",null," Select a target"),r.createElement("div",{className:t.pluginsRow},r.createElement(b.a,{scrollAmount:300},n.map((function(e){var n=Object(m.E)(e,"widgetJson","display-name")||e.name,i=Object(m.E)(e,"widgetJson","icon","arguments","data");return r.createElement(f,{key:e.name+" - "+e.artifact.version,className:t.pluginCard,onClick:function(){a(e)}},r.createElement("div",{className:t.pluginImageContainer},r.createElement(E.a,{condition:i},r.createElement("img",{className:t.pluginIcon,src:i})),r.createElement(E.a,{condition:!i},r.createElement("div",{className:t.pluginFAIcon+" fa "+h(e.name.toLowerCase())}))),r.createElement("h5",{className:t.cardTitle},n))})))))})),v=function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,a,i=n.call(e),o=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)o.push(r.value)}catch(e){a={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(a)throw a.error}}return o},_=i()((function(e){return{root:{width:"100%"},pluginsRow:{display:"flex",flexDirection:"row",flexWrap:"wrap"},title:{display:"flex",alignItems:"center"},pluginCard:{display:"flex",flexDirection:"column",margin:"10px",alignItems:"center",width:"250px",height:"255px",flexShrink:0,justifyContent:"space-around"},pluginImageContainer:{display:"flex",alignItems:"center"},pluginImageBackground:{display:"flex",width:"100%",minHeight:"128px",justifyContent:"center",backgroundColor:e.palette.grey[700]},sourceListTable:{width:"900px"},tablePluginIcon:{width:"32px",height:"auto"},tablePluginFAIcon:{fontSize:"32px"},ingestionHeader:{backgroundColor:e.palette.grey[700],color:e.palette.grey[100]},targetName:{cursor:"pointer",marginRight:"5px"},targetsCell:{},pluginIcon:{width:"100px",height:"auto"},pluginFAIcon:{fontSize:"64px"},cardTitle:{padding:"15px"},cardButtonsContainer:{display:"flex",width:"100%",justifyContent:"center"}}}))((function(e){var t=e.classes,n=e.plugins,a=e.sinks,i=e.onPluginSelect,s=v(r.useState(null),2),c=s[0],l=s[1],p=Boolean(c);var u=r.createElement(y,{plugins:a,onPluginSelect:i});return r.createElement("div",{className:t.root},r.createElement(b.a,{scrollAmount:650},n.map((function(e){var n=S(e),a=Object(m.E)(e,"widgetJson","icon","arguments","data");return r.createElement(f,{key:e.name+" - "+e.artifact.version,className:t.pluginCard},r.createElement("div",{className:t.pluginImageBackground},r.createElement("div",{className:t.pluginImageContainer},r.createElement(E.a,{condition:a},r.createElement("img",{className:t.pluginIcon,src:a})),r.createElement(E.a,{condition:!a},r.createElement("div",{className:t.pluginFAIcon+" fa "+h(e.name.toLowerCase())})))),r.createElement("div",{className:t.cardTitle},r.createElement("h3",null,n)),r.createElement("div",{className:t.cardButtonsContainer},r.createElement(o.a,{className:t.targetsButton,color:"primary",onClick:function(t){return function(e,t){l(e.currentTarget),i(t)}(t,e)}},"Show Targets")))}))),r.createElement(g.a,{open:p,anchorEl:c,onClose:function(){l(null)},anchorOrigin:{vertical:"bottom",horizontal:"center"},transformOrigin:{vertical:"top",horizontal:"center"}},r.createElement(E.a,{condition:a.length>0},u)))})),C=n(37),T=n(1474),O=n(1476),N=n(279),I=n(1475),w=n(714),R=n(6),x=n.n(R),k=function(){return(k=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var a in t=arguments[n])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)},A=i()((function(e){return{root:{width:"100%"},pluginsRow:{display:"flex",flexDirection:"row",flexWrap:"wrap"},title:{display:"flex",alignItems:"center"},pluginCard:{display:"flex",flexDirection:"column",margin:"10px",alignItems:"center",width:"250px",height:"255px",flexShrink:0,justifyContent:"space-around"},pluginImageContainer:{display:"flex",alignItems:"center"},tableText:{fontSize:"1rem"},tableRow:{width:"100%"},pluginImageBackground:{display:"flex",width:"100%",minHeight:"128px",justifyContent:"center",backgroundColor:e.palette.grey[700]},tablePluginIcon:{width:"32px",height:"auto"},tablePluginFAIcon:{fontSize:"32px"},ingestionHeader:{backgroundColor:e.palette.grey[700],color:e.palette.grey[100]},targetName:{cursor:"pointer",margin:"0px 5px",color:e.palette.blue[100]},targetsCell:{maxWidth:"50%"},sourceNameCell:{minWidth:"300px"},targetsCellHeader:{maxWidth:"50%"},pluginIcon:{width:"100px",height:"auto"},pluginFAIcon:{fontSize:"64px"},cardTitle:{padding:"15px"},cardButtonsContainer:{display:"flex",width:"100%",justifyContent:"center"},targetsButton:{}}}))((function(e){var t=e.classes,n=e.plugins,a=e.sinks,i=e.onSourceSinkSelect;return r.createElement("div",{className:t.root},r.createElement(p.a,{className:t.sourceListTable},r.createElement(T.a,{className:t.table},r.createElement(I.a,{className:t.ingestionHeader},r.createElement(w.a,null,r.createElement(N.a,null),r.createElement(N.a,{className:t.tableText},"Source Name"),r.createElement(N.a,{align:"left",className:t.tableText},"Target"))),r.createElement(O.a,null,n.map((function(e,n){var o=S(e),s=Object(m.E)(e,"widgetJson","icon","arguments","data"),c=a.map((function(n,o){var s=S(n);return r.createElement("span",{key:o+"-"+s},r.createElement("span",{className:t.targetName,onClick:function(){return i(e,n)}},s),r.createElement(E.a,{condition:o!==a.length-1},r.createElement("span",null," | ")))}));return r.createElement(w.a,{key:n+"-"+o,className:x()(t.tableRow,t.tableText)},r.createElement(N.a,{className:t.tableText},r.createElement(E.a,{condition:s},r.createElement("img",{className:t.tablePluginIcon,src:s})),r.createElement(E.a,{condition:!s},r.createElement("div",{className:t.tablePluginFAIcon+" fa "+h(e.name.toLowerCase())}))),r.createElement(N.a,{className:x()(t.sourceNameCell,t.tableText)},o),r.createElement(N.a,{className:x()(t.targetsCell,t.tableText),align:"left"},c))}))))))}));function P(e){return r.createElement(C.a,null,r.createElement(A,k({},e)))}P.propTypes={};var L,D=P,M=n(164),j=n(261),V=n(1483),U=(L=function(e,t){return(L=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}L(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),B=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return U(t,e),t.prototype.render=function(){var e=this.props,t=e.classes,n=e.configurationGroupProps,a=e.title,i=e.plugin,o=S(i),s=Object(m.E)(i,"widgetJson","icon","arguments","data");return r.createElement(f,{className:t.root},r.createElement("div",{className:t.heading},r.createElement("div",{className:t.headingTitle},r.createElement("h5",null,a.toUpperCase()),r.createElement("h2",null,o)),r.createElement("div",{className:t.pluginIconContainer},r.createElement(E.a,{condition:s},r.createElement("img",{className:t.pluginIcon,src:s})),r.createElement(E.a,{condition:!s},r.createElement("div",{className:t.pluginFAIcon+" fa "+h(this.props.plugin.name.toLowerCase())})))),r.createElement("div",{className:t.labelContainer},r.createElement(V.a,{label:"Label",variant:"outlined",margin:"dense",fullWidth:!0,value:n.label,onChange:function(e){return n.onLabelChange(e.target.value)}})),r.createElement(E.a,{condition:n.pluginProperties},r.createElement(j.a,{pluginProperties:n.pluginProperties,widgetJson:i.widgetJson,values:n.values,onChange:n.onChange,validateProperties:function(e){e()}})))},t}(r.Component),G=i()((function(){return{root:{height:"auto",padding:"20px"},labelContainer:{padding:"10px",paddingLeft:"0px",width:"100%"},heading:{display:"flex",justifyContent:"space-between"},pluginIconContainer:{display:"flex",alignSelf:"right"},pluginFAIcon:{fontSize:"32px"},headingTitle:{display:"flex",flexDirection:"column"},pluginIcon:{width:"64px"}}}))(B),F=function(){return(F=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var a in t=arguments[n])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)},H=i()((function(e){return{root:{display:"flex",flexDirection:"column",alignItems:"center",backgroundColor:e.palette.grey[700],padding:"20px"},propsRenderBlock:{margin:"0 40px",minWidth:"40%",maxHeight:"60vh",overflowY:"scroll"},propsContainer:{display:"flex",flexDirection:"row",justifyContent:"center",width:"100%"},jobInfo:{display:"flex",flexDirection:"column",alignItems:"center"}}}))((function(e){var t=e.classes,n=e.sourceBP,a=e.selectedSource,i=e.sinkBP,o=e.selectedSink,s=e.onSourceChange,c=e.onSinkChange,l={pluginProperties:n&&n.properties,widgetJson:a&&a.widgetJson,values:a&&a.properties,label:a.label,onChange:function(e){var t=F({},a);t.properties=F(F({},t.properties),e),s(t)},onLabelChange:function(e){var t=F({},a);t.label=e,s(t)}},p={pluginProperties:i&&i.properties,widgetJson:o&&o.widgetJson,values:o&&o.properties,label:o.label,onChange:function(e){var t=F({},o);t.properties=F(F({},t.properties),e),c(t)},onLabelChange:function(e){var t=F({},o);t.label=e,c(t)}};return r.createElement("div",{className:t.root},r.createElement("div",{className:t.propsContainer},r.createElement(E.a,{condition:n&&a},r.createElement("div",{className:t.propsRenderBlock},r.createElement(G,{title:"Source",plugin:a,configurationGroupProps:l}))),r.createElement(E.a,{condition:i&&o},r.createElement("div",{className:t.propsRenderBlock},r.createElement(G,{title:"Target",plugin:o,configurationGroupProps:p})))))}));var K=function(e){return r.createElement(C.a,null,r.createElement(H,F({},e)))},z=n(154),Y=n.n(z),W=n(278),J=n(282),X=n.n(J),q=n(125),Z=n(8),Q=n(122),$=n(339),ee=n(510),te=n(1776),ne=function(){var e=function(t,n){return(e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])})(t,n)};return function(t,n){function r(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}(),re=function(){return(re=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var a in t=arguments[n])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)},ae=function(e,t,n,r){return new(n||(n=Promise))((function(a,i){function o(e){try{c(r.next(e))}catch(e){i(e)}}function s(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,s)}c((r=r.apply(e,t||[])).next())}))},ie=function(e,t){var n,r,a,i,o={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;o;)try{if(n=1,r&&(a=2&i[0]?r.return:i[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,i[1])).done)return a;switch(r=0,a&&(i=[2&i[0],a.value]),i[0]){case 0:case 1:a=i;break;case 4:return o.label++,{value:i[1],done:!1};case 5:o.label++,r=i[1],i=[0];continue;case 7:i=o.ops.pop(),o.trys.pop();continue;default:if(!(a=o.trys,(a=a.length>0&&a[a.length-1])||6!==i[0]&&2!==i[0])){o=0;continue}if(3===i[0]&&(!a||i[1]>a[0]&&i[1]<a[3])){o.label=i[1];break}if(6===i[0]&&o.label<a[1]){o.label=a[1],a=i;break}if(a&&o.label<a[2]){o.label=a[2],o.ops.push(i);break}a[2]&&o.ops.pop(),o.trys.pop();continue}i=t.call(e,o)}catch(e){i=[6,e],r=0}finally{n=a=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}},oe=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.state={filterStr:"",filteredSources:[],batchsource:[],batchsink:[],selectedSource:null,selectedSink:null,sourceBP:null,sinkBP:null,pipelineName:"",publishingPipeline:!1,pipelineDescription:"",modalOpen:!1,tableView:!0,showConfig:!1,pipelineNameError:!1,deployFailed:!1,cdapVersion:"",currentNs:"default"},t.fetchSourceSink=function(e,n){t.fetchPlugins("batchsource",e,n),t.fetchPlugins("batchsink",e,n)},t.fetchPlugins=function(e,n,r){return void 0===r&&(r="default"),ae(t,void 0,void 0,(function(){var t,a,i=this;return ie(this,(function(o){switch(o.label){case 0:return[4,M.a.fetchPlugins({namespace:r,pipelineType:"cdap-data-pipeline",version:n,extensionType:e}).toPromise()];case 1:return t=o.sent(),a=t.map((function(e){return ae(i,void 0,void 0,(function(){var t,n,a;return ie(this,(function(i){switch(i.label){case 0:return t={namespace:r,artifactName:e.artifact.name,artifactVersion:e.artifact.version,scope:e.artifact.scope,keys:"widgets."+e.name+"-"+e.type},[4,M.a.fetchWidgetJson(t).toPromise()];case 1:return n=i.sent(),a=JSON.parse(n["widgets."+e.name+"-"+e.type]),[2,re(re({},e),{widgetJson:a})]}}))}))})),Promise.all(a).then((function(t){var n;i.setState(((n={})[e]=t.sort((function(e,t){var n=S(e),r=S(t);return n.localeCompare(r,void 0,{sensitivity:"accent"})})),n),(function(){"batchsource"===e&&i.onFilter({target:{value:""}})}))})),[2]}}))}))},t.onPluginSelect=function(e){var n,r;if("batchsource"===e.type){if((t.state.selectedSource&&t.state.selectedSource.name)===e.name)return;r="selectedSource"}else{if("batchsink"!==e.type)return;if((t.state.selectedSink&&t.state.selectedSink.name)===e.name)return;r="selectedSink"}var a=S(e);t.setState(((n={})[r]=re(re({},e),{label:a}),n.modalOpen="selectedSink"===r,n.showConfig="selectedSink"===r,n),(function(){t.getPluginProps(e)}))},t.onSourceSinkSelect=function(e,n){var r=S(e),a=S(n);t.setState({selectedSink:re(re({},n),{label:a}),selectedSource:re(re({},e),{label:r})},(function(){t.getPluginProps(e),t.getPluginProps(n),t.setState({modalOpen:!0,showConfig:!0})}))},t.toggleView=function(){t.setState({tableView:!t.state.tableView})},t.getPluginProps=function(e){var n={namespace:t.state.currentNs,parentArtifact:"cdap-data-pipeline",version:t.state.cdapVersion,extension:e.type,pluginName:e.name,scope:"SYSTEM",artifactName:e.artifact.name,artifactScope:e.artifact.scope,limit:1,order:"DESC"};M.a.getPluginProperties(n).subscribe((function(n){"batchsource"===e.type?t.setState({sourceBP:n[0]}):"batchsink"===e.type&&t.setState({sinkBP:n[0]})}))},t.generatePipelineConfig=function(){var e=[],n=[];if(t.state.selectedSource&&t.state.selectedSink){var r=t.state.selectedSource.label||Object(m.E)(t.state.selectedSource,"plugin","name")||Object(m.E)(t.state.selectedSource,"name"),a=t.state.selectedSink.label||Object(m.E)(t.state.selectedSink,"plugin","name")||Object(m.E)(t.state.selectedSink,"name");e=[{name:r,plugin:{name:t.state.selectedSource.name,type:t.state.selectedSource.type,label:t.state.selectedSource.label,artifact:t.state.selectedSource.artifact,properties:t.state.selectedSource.properties}},{name:a,plugin:{name:t.state.selectedSink.name,type:t.state.selectedSink.type,label:t.state.selectedSink.label,artifact:t.state.selectedSink.artifact,properties:t.state.selectedSink.properties}}],n=[{to:a,from:r}]}var i=te.b.getState(),o=i.engine,s=i.driverResources,c=i.resources,l=i.maxConcurrentRuns,p=i.numOfRecordsPreview,u=i.stageLoggingEnabled,d=i.processTimingEnabled,f=i.schedule;return{artifact:{name:"cdap-data-pipeline",version:t.state.cdapVersion,scope:"SYSTEM"},description:t.state.pipelineDescription,name:t.state.pipelineName,label:"data-ingestion-job",config:{resources:c,driverResources:s,connections:n,properties:{},processTimingEnabled:d,stageLoggingEnabled:u,stages:e,schedule:f,engine:o,numOfRecordsPreview:p,maxConcurrentRuns:l}}},t.publishPipeline=function(){if(t.state.pipelineName){t.setState({publishingPipeline:!0});var e=t.generatePipelineConfig();M.a.publish({namespace:t.state.currentNs,appId:e.name},e).toPromise().then((function(){var e=Object(Z.d)();window.location.href="../pipelines/ns/"+e+"/view/"+t.state.pipelineName,t.setState({publishingPipeline:!1})})).catch((function(e){console.log("publishing pipeline failed",e),t.setState({publishingPipeline:!1,deployFailed:!0})}))}else t.setState({pipelineNameError:!0})},t.onFilter=function(e){var n=e.target.value,r=t.state.batchsource.filter((function(e){var t=S(e);return t&&t.toLowerCase().includes(n)}));t.setState({filteredSources:r,filterStr:n})},t.onSourceChange=function(e){t.setState({selectedSource:e})},t.onSinkChange=function(e){t.setState({selectedSink:e})},t.closeModal=function(){t.setState({modalOpen:!1,showConfig:!1,pipelineName:"",pipelineDescription:""})},t}return ne(t,e),t.prototype.componentDidMount=function(){var e=this,t=Object(Z.d)(),n=Q.a.getState().version;n?(this.fetchSourceSink(n,t),this.setState({currentNs:t,cdapVersion:n})):ee.a.get().subscribe((function(r){n=r.version,Q.a.dispatch({type:$.a.updateVersion,payload:{version:r.version}}),e.fetchSourceSink(n,t),e.setState({currentNs:t,cdapVersion:n})}))},t.prototype.render=function(){var e=this,t=this.props.classes;return r.createElement("div",{className:t.root},r.createElement(Y.a,{title:"Ingestion"}),r.createElement(q.a,{showAlert:this.state.deployFailed,type:"error",message:"Failed to deploy transfer job",onClose:function(){return e.setState({deployFailed:!1})}}),r.createElement(E.a,{condition:!this.state.showConfig},r.createElement(r.Fragment,null,r.createElement("div",{className:t.createJobHeader},r.createElement("h4",null,"Create a transfer job.")),r.createElement("div",{className:t.selectionContainer},r.createElement("h4",{className:t.instructionHeading},"Select a source and target for the transfer."),r.createElement("div",{className:t.filterBox},r.createElement(V.a,{className:t.filterInput,variant:"outlined",label:"Search by source name",margin:"dense",value:this.state.filterStr,onChange:this.onFilter})),r.createElement("div",{className:t.countAndToggle},r.createElement("span",null,this.state.filteredSources.length+" sources"),r.createElement("span",{className:t.toggleView,onClick:this.toggleView},"Toggle View")),this.state.tableView?r.createElement(D,{onSourceSinkSelect:this.onSourceSinkSelect,plugins:this.state.filteredSources,sinks:this.state.batchsink}):r.createElement(_,{title:"Sources",plugins:this.state.filteredSources,onPluginSelect:this.onPluginSelect,onSourceSinkSelect:this.onSourceSinkSelect,sinks:this.state.batchsink})))),r.createElement(E.a,{condition:this.state.showConfig},r.createElement("div",{className:t.configureHeader},r.createElement("h4",null,"Configure the transfer job."),r.createElement(W.a,{onClick:this.closeModal},r.createElement(X.a,{fontSize:"large"}))),r.createElement("div",{className:t.jobInfo},r.createElement("div",{className:t.transferDetailsContainer},r.createElement(V.a,{variant:"outlined",label:"Transfer Name",margin:"dense",required:!0,error:this.state.pipelineNameError,value:this.state.pipelineName,onChange:function(t){return e.setState({pipelineName:t.target.value,pipelineNameError:!1})}}),r.createElement(V.a,{variant:"outlined",label:"Description",margin:"dense",value:this.state.pipelineDescription,onChange:function(t){return e.setState({pipelineDescription:t.target.value})}})),r.createElement(o.a,{className:t.deployTransferBtn,disabled:this.state.publishingPipeline,color:"primary",variant:"contained",onClick:this.publishPipeline},"Deploy Transfer")),r.createElement(K,{sourceBP:this.state.sourceBP,selectedSource:this.state.selectedSource,sinkBP:this.state.sinkBP,selectedSink:this.state.selectedSink,onSourceChange:this.onSourceChange,onSinkChange:this.onSinkChange})))},t}(r.Component),se=i()((function(e){return{root:{display:"flex",flexDirection:"column"},createJobHeader:{backgroundColor:e.palette.grey[700],padding:"5px",paddingLeft:"20px",height:"60px",display:"flex",alignItems:"center"},selectionContainer:{padding:"20px"},propsRenderBlock:{margin:"0 40px",width:"40%",propsContainer:{display:"flex"},flexDirection:"row",justifyContent:"center"},filterBox:{display:"flex",flexDirection:"column",maxWidth:"500px",marginBottom:"10px"},filterInput:{marginBottom:"10px"},jobInfo:{display:"flex",flexDirection:"column",margin:"10px"},instructionHeading:{marginTop:"10px"},modalContent:{height:"90%",margin:"100px"},countAndToggle:{display:"flex",justifyContent:"space-between",marginBottom:"10px",fontSize:"1rem"},toggleView:{color:e.palette.blue[100],cursor:"pointer"},configureHeader:{display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:"5px",paddingLeft:"20px",backgroundColor:e.palette.grey[700]},transferDetailsContainer:{maxWidth:"500px",flexDirection:"column",display:"flex"},deployTransferBtn:{alignSelf:"flex-end"}}}))(oe);t.default=se}}]);