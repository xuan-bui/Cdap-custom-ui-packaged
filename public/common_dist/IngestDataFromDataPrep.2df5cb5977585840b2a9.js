(window.webpackJsonpCaskCommon=window.webpackJsonpCaskCommon||[]).push([[2],{2533:function(e,t,a){var n=a(21),r=a(2534);"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[e.i,r,""]]);var o={insert:"head",singleton:!1},s=(n(e.i,r,o),r.locals?r.locals:{});e.exports=s},2534:function(e,t,a){(t=a(20)(!1)).push([e.i,".cdap-modal.dataprep-create-dataset-modal form input.form-control,.cdap-modal.dataprep-create-dataset-modal form select.form-control{width:calc(100% - 20px);display:inline-block;margin-right:5px}.cdap-modal.dataprep-create-dataset-modal form .icon-info-circle{fill:#5a84e4;cursor:pointer}.cdap-modal.dataprep-create-dataset-modal form .dataset-name-group{position:relative}.cdap-modal.dataprep-create-dataset-modal form .dataset-name-group .required-label{position:absolute;top:-21px}.cdap-modal.dataprep-create-dataset-modal form .col-form-label .text-danger{margin-left:3px}.cdap-modal.dataprep-create-dataset-modal form .input-type-group button:focus,.cdap-modal.dataprep-create-dataset-modal form .input-type-group button:active{outline:none}.cdap-modal.dataprep-create-dataset-modal .modal-header .close-section.disabled{color:#ccc;cursor:not-allowed}.cdap-modal.dataprep-create-dataset-modal .modal-body{min-height:200px}.cdap-modal.dataprep-create-dataset-modal .modal-body.copying-steps-container{display:flex;justify-content:center;align-items:center;font-size:18px}.cdap-modal.dataprep-create-dataset-modal .modal-body.copying-steps-container .steps-container .step-container>span:first-child{margin-right:5px}.cdap-modal.dataprep-create-dataset-modal .modal-body.copying-steps-container .steps-container .btn.btn-primary{margin-top:15px}",""]),e.exports=t},2649:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return ae}));var n=a(1),r=a.n(n),o=a(0),s=a.n(o),c=a(2),i=a.n(c),l=a(705),p=a(707),u=a(706),m=a(564),f=a(704),d=a(855),b=a(268),g=a(467),y=a(253),h=a(393),j=a(283),v=a(119),S=a(3),_=a.n(S),k=a(9),P=a(4),O=a(17),w=a(854),E=a(172),F=a(1049),T=a(280),N=a(190),C=a(8),x=a(152),Q=a.n(x),$=a(29),D=a.n($),M=a(48),I=a.n(M),q=a(69),A=a.n(q),B=a(31),K=a(144);function L(e){return(L="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function R(e){return function(e){if(Array.isArray(e))return z(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return z(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);"Object"===a&&e.constructor&&(a=e.constructor.name);if("Map"===a||"Set"===a)return Array.from(e);if("Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))return z(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function z(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,n=new Array(t);a<t;a++)n[a]=e[a];return n}function U(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function W(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function G(e,t){return(G=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function J(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var a,n=X(e);if(t){var r=X(this).constructor;a=Reflect.construct(n,arguments,r)}else a=n.apply(this,arguments);return H(this,a)}}function H(e,t){return!t||"object"!==L(t)&&"function"!=typeof t?V(e):t}function V(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function X(e){return(X=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function Y(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}a(2533);var Z="features.DataPrep.TopPanel.copyToCDAPDatasetBtn",ee=[{id:"TPFSAvro",label:i.a.translate("".concat(Z,".Formats.avro"))},{id:"TPFSOrc",label:i.a.translate("".concat(Z,".Formats.orc"))},{id:"TPFSParquet",label:i.a.translate("".concat(Z,".Formats.parquet"))}],te=[{message:i.a.translate("".concat(Z,".copyingSteps.Step1")),error:i.a.translate("".concat(Z,".copyingSteps.Step1Error")),status:null},{message:i.a.translate("".concat(Z,".copyingSteps.Step2")),error:i.a.translate("".concat(Z,".copyingSteps.Step2Error")),status:null}],ae=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&G(e,t)}(o,e);var t,a,n,r=J(o);function o(){var e;U(this,o);for(var t=arguments.length,a=new Array(t),n=0;n<t;n++)a[n]=arguments[n];return Y(V(e=r.call.apply(r,[this].concat(a))),"state",e.getDefaultState()),Y(V(e),"toggleModal",(function(){var t=Object.assign(e.getDefaultState(),{showModal:!e.state.showModal,sinkPluginsForDataset:e.state.sinkPluginsForDataset,batchPipelineConfig:e.state.batchPipelineConfig});e.setState(t),e.state.showModal||Object(w.a)().subscribe((function(t){e.setState({batchPipelineConfig:t.batchConfig})}),(function(t){e.setState({error:t})}))})),Y(V(e),"handleDatasetNameChange",(function(t){e.setState({datasetName:t.target.value})})),Y(V(e),"handleRowkeyChange",(function(t){e.setState({rowKey:t.target.value})})),Y(V(e),"handleFormatChange",(function(t){e.setState({format:t.target.value})})),Y(V(e),"handleOnSubmit",(function(e){return Object(P.preventPropagation)(e),!1})),Y(V(e),"submitForm",(function(){var t=A()(te),a=O.a.getState().dataprep,n=Object(P.objectQuery)(a,"workspaceInfo","properties");t[0].status="running",e.setState({copyInProgress:!0,copyingSteps:t});var r,o,s,c=C.default.getState().selectedNamespace,i=e.state.batchPipelineConfig.config.stages.find((function(e){return"Database"===e.name}));"fileset"===e.state.inputType?(r="one_time_copy_to_fs_".concat(e.state.format),"database"===n.connection?r="one_time_copy_to_fs_from_".concat(i.plugin.properties.jdbcPluginName):"kafka"===n.connection?r="one_time_copy_to_fs_from_kafka":"s3"===n.connection?r="one_time_copy_to_fs_from_s3":"gcs"===n.connection?r="one_time_copy_to_fs_from_gcs":"bigquery"===n.connection?r="one_time_copy_to_fs_from_bigquery":"spanner"===n.connection?r="one_time_copy_to_fs_from_spanner":"adls"===n.connection&&(r="one_time_copy_to_fs_from_adls")):(r="one_time_copy_to_table","database"===n.connection?r="one_time_copy_to_table_from_".concat(i.plugin.properties.jdbcPluginName):"kafka"===n.connection?r="one_time_copy_to_table_from_kafka":"s3"===n.connection?r="one_time_copy_to_table_from_s3":"gcs"===n.connection?r="one_time_copy_to_table_from_gcs":"bigquery"===n.connection?r="one_time_copy_to_table_from_bigquery":"spanner"===n.connection?r="one_time_copy_to_table_from_spanner":"adls"===n.connection&&(r="one_time_copy_to_table_from_adls")),r=(r=r.replace("TPFS","")).toLowerCase(),T.a.list({namespace:c}).mergeMap((function(t){if(!t.find((function(e){return e.id===r}))){var a=e.preparePipelineConfig();o=a.appConfig,s=a.macroMap,o.name=r;var n={namespace:c,appId:r};return T.a.deployApp(n,o)}return B.Observable.create((function(e){e.next()}))})).mergeMap((function(){var t=R(e.state.copyingSteps);return t[0].status="success",t[1].status="running",e.setState({copyingSteps:t}),s||(s=e.getAppConfigMacros()),N.a.action({namespace:c,appId:r,programType:"workflows",programId:"DataPipelineWorkflow",action:"start"},s)})).mergeMap((function(){e.setState({copyTaskStarted:!0});return B.Observable.create((function(t){!function t(a,n,r){var o={namespace:c,datasetId:e.state.datasetName};F.a.get(o).subscribe(a,(function(){r<120?(r+=r,setTimeout((function(){t(a,n,r)}),1e3*r)):n()}))}((function(){t.next()}),(function(){t.error("Copy task timed out after 2 mins. Please check logs for more information.")}),1)}))})).subscribe((function(){var t=R(e.state.copyingSteps),a=C.default.getState().selectedNamespace;t[1].status="success";var n=window.getAbsUIUrl({namespaceId:a,entityType:"datasets",entityId:e.state.datasetName});n="".concat(n,"?modalToOpen=explore"),e.setState({copyingSteps:t,datasetUrl:n})}),(function(t){console.log("err",t);var a={copyingSteps:e.state.copyingSteps.map((function(e){return"running"===e.status?Object.assign({},e,{status:"failure"}):e}))};e.state.error||(a.error="object"===L(t)?t.response:t),e.setState(a)}))})),e}return t=o,(a=[{key:"getDefaultState",value:function(){var e=O.a.getState().dataprep.headers;return{showModal:!1,inputType:"fileset",rowKey:e.length?e[0]:null,format:ee[0].id,sinkPluginsForDataset:{},batchPipelineConfig:{},datasetName:"",copyingSteps:[].concat(te),copyInProgress:!1,copyTaskStarted:!1,datasetUrl:null,error:null}}},{key:"componentWillMount",value:function(){var e,t=this,a=C.default.getState().selectedNamespace;E.a.list({namespace:a}).subscribe((function(a){(e=Q()(a,{name:"core-plugins"}))&&(e.version="[1.7.0, 3.0.0)");var n=function(t){return{name:t,plugin:{name:t,label:t,type:"batchsink",artifact:e,properties:{}}}},r={TPFSAvro:n("TPFSAvro"),TPFSParquet:n("TPFSParquet"),TPFSOrc:n("TPFSOrc"),Table:n("Table")};t.setState({sinkPluginsForDataset:r})}))}},{key:"getAppConfigMacros",value:function(){var e=O.a.getState().dataprep,t=e.workspaceInfo,a=e.directives,n=e.headers,r=A()(this.state.batchPipelineConfig),o=r.config.stages.find((function(e){return"Wrangler"===e.name})),s=r.config.stages.find((function(e){return"Database"===e.name})),c=r.config.stages.find((function(e){return"Kafka"===e.name})),i=Object(P.objectQuery)(t,"properties","databaseConfig"),l=r.config.stages.find((function(e){return"S3"===e.name})),p=r.config.stages.find((function(e){return"GCS"===e.name})),u=r.config.stages.find((function(e){return"BigQueryTable"===e.name})),m=r.config.stages.find((function(e){return"Spanner"===e.name})),f=r.config.stages.find((function(e){return"ADLS"===e.name})),d={};if(i){try{i=JSON.parse(i)}catch(e){i={}}d=Object.assign(d,i)}d=Object.assign({},d,{datasetName:this.state.datasetName,filename:Object(P.objectQuery)(t,"properties","path")||"",directives:a.join("\n"),schema:Object(P.objectQuery)(o,"plugin","properties","schema")||"",schemaRowField:D()(this.state.rowKey)?n[0]:this.state.rowKey,query:Object(P.objectQuery)(s,"plugin","properties","importQuery")||"",connectionString:Object(P.objectQuery)(s,"plugin","properties","connectionString")||"",password:Object(P.objectQuery)(s,"plugin","properties","password")||"",userName:Object(P.objectQuery)(s,"plugin","properties","user")||"",topic:Object(P.objectQuery)(c,"plugin","properties","topic")||"",kafkaBrokers:Object(P.objectQuery)(c,"plugin","properties","kafkaBrokers")||"",accessID:Object(P.objectQuery)(l,"plugin","properties","accessID")||"",path:Object(P.objectQuery)(l,"plugin","properties","path")||Object(P.objectQuery)(p,"plugin","properties","path")||"",accessKey:Object(P.objectQuery)(l,"plugin","properties","accessKey")||"",bucket:Object(P.objectQuery)(p,"plugin","properties","bucket")||"",serviceFilePath:Object(P.objectQuery)(p,"plugin","properties","serviceFilePath")||"",project:Object(P.objectQuery)(p,"plugin","properties","project")||"",bqBucket:Object(P.objectQuery)(u,"plugin","properties","bucket")||"",bqServiceFilePath:Object(P.objectQuery)(u,"plugin","properties","serviceFilePath")||"",bqProject:Object(P.objectQuery)(u,"plugin","properties","project")||"",bqDataset:Object(P.objectQuery)(u,"plugin","properties","dataset")||"",bqTable:Object(P.objectQuery)(u,"plugin","properties","table")||"",bqSchema:Object(P.objectQuery)(u,"plugin","properties","schema")||"",spannerServiceFilePath:Object(P.objectQuery)(m,"plugin","properties","serviceFilePath")||"",spannerProject:Object(P.objectQuery)(m,"plugin","properties","project")||"",spannerInstance:Object(P.objectQuery)(m,"plugin","properties","instance")||"",spannerDatabase:Object(P.objectQuery)(m,"plugin","properties","database")||"",spannerTable:Object(P.objectQuery)(m,"plugin","properties","table")||"",spannerSchema:Object(P.objectQuery)(m,"plugin","properties","schema")||"",adlsProject:Object(P.objectQuery)(f,"plugin","properties","project")||""});var b={};return Object.keys(d).filter((function(e){return!I()(d[e])})).forEach((function(e){return b[e]=d[e]})),b}},{key:"addMacrosToPipelineConfig",value:function(e){var t=O.a.getState().dataprep,a=Object(P.objectQuery)(t,"workspaceInfo","properties"),n=this.getAppConfigMacros(),r={schema:"${schema}",name:"${datasetName}"},o={Wrangler:{directives:"${directives}",schema:"${schema}",field:"file"===a.connection?"body":"*",precondition:"false",threshold:"1"},File:{path:"${filename}",referenceName:"FileNode"},Table:{"schema.row.field":"${schemaRowField}",name:"${datasetName}",schema:"${schema}"},Database:{connectionString:"${connectionString}",user:"${userName}",password:"${password}",importQuery:"${query}"},Kafka:{referenceName:"KafkaNode",kafkaBrokers:"${kafkaBrokers}",topic:"${topic}"},TPFSOrc:r,TPFSParquet:r,TPFSAvro:r,S3:{accessID:"${accessID}",path:"${path}",accessKey:"${accessKey}",authenticationMethod:"Access Credentials",recursive:"false"},GCS:{bucket:"${bucket}",filenameOnly:"false",path:"${path}",serviceFilePath:"${serviceFilePath}",project:"${project}",recursive:"false",ignoreNonExistingFolders:"false"},BigQueryTable:{project:"${bqProject}",serviceFilePath:"${bqServiceFilePath}",bucket:"${bqBucket}",dataset:"${bqDataset}",table:"${bqTable}",schema:"${bqSchema}"},Spanner:{project:"${spannerProject}",serviceFilePath:"${spannerServiceFilePath}",instance:"${spannerInstance}",database:"${spannerDatabase}",table:"${spannerTable}",schema:"${spannerSchema}"},ADLS:{project:"${adlsProject}"}};return e.config.stages=e.config.stages.map((function(e){return D()(o[e.name])||(e.plugin.properties=Object.assign({},e.plugin.properties,o[e.name])),e})),{pipelineConfig:e,macroMap:n}}},{key:"preparePipelineConfig",value:function(){var e,t=this,a=O.a.getState().dataprep.workspaceInfo.properties.name,n=A()(this.state.batchPipelineConfig);"fileset"===this.state.inputType&&(e=ee.find((function(e){return e.id===t.state.format})))&&(e=this.state.sinkPluginsForDataset[e.id]),"table"===this.state.inputType&&(e=this.state.sinkPluginsForDataset.Table),n.config.stages.push(e);var r=this.addMacrosToPipelineConfig(n),o=r.pipelineConfig,s=r.macroMap,c=this.state.batchPipelineConfig.config.connections,i=[{from:c[0].to,to:e.name}];return o.config.connections=c.concat(i),o.config.schedule="0 * * * *",o.config.engine="mapreduce",o.description="Pipeline to create dataset for workspace ".concat(a," from dataprep"),{appConfig:o,macroMap:s}}},{key:"setType",value:function(e){this.setState({inputType:e})}},{key:"renderDatasetSpecificContent",value:function(){if("table"===this.state.inputType){var e=O.a.getState().dataprep.headers;return s.a.createElement(l.a,{row:!0},s.a.createElement(p.a,{xs:"4",className:"text-right"},i.a.translate("".concat(Z,".Form.rowKeyLabel")),s.a.createElement("span",{className:"text-danger"},"*")),s.a.createElement(u.a,{xs:"6"},s.a.createElement(m.a,{type:"select",onChange:this.handleRowkeyChange,value:this.state.rowKey},e.map((function(e,t){return s.a.createElement("option",{value:e,key:t},e)}))),s.a.createElement(k.default,{id:"row-key-info-icon",name:"icon-info-circle"}),s.a.createElement(v.b,{target:"row-key-info-icon",delay:{show:250,hide:0}},i.a.translate("".concat(Z,".Form.rowKeyTooltip")))))}if("fileset"===this.state.inputType)return s.a.createElement(l.a,{row:!0},s.a.createElement(p.a,{xs:"4",className:"text-right"},i.a.translate("".concat(Z,".Form.formatLabel")),s.a.createElement("span",{className:"text-danger"},"*")),s.a.createElement(u.a,{xs:"6"},s.a.createElement(m.a,{type:"select",onChange:this.handleFormatChange,value:this.state.format},ee.map((function(e,t){return s.a.createElement("option",{value:e.id,key:t},e.label)}))),s.a.createElement(k.default,{id:"row-key-info-icon",name:"icon-info-circle"}),s.a.createElement(v.b,{target:"row-key-info-icon",delay:{show:250,hide:0}},i.a.translate("".concat(Z,".Form.formatTooltip")))))}},{key:"renderSteps",value:function(){return this.state.copyInProgress?s.a.createElement("div",{className:"text-left steps-container"},this.state.copyingSteps.map((function(e,t){return s.a.createElement("div",{key:t,className:_()("step-container",{"text-success":"success"===e.status,"text-danger":"failure"===e.status,"text-info":"running"===e.status,"text-muted":null===e.status})},s.a.createElement("span",null,("running"===(a=e.status)&&(n="icon-spinner",r="fa-spin"),"success"===a&&(n="icon-check-circle"),"failure"===a&&(n="icon-times-circle"),s.a.createElement(k.default,{name:n,className:r}))),s.a.createElement("span",null,"failure"===e.status?e.error:e.message));var a,n,r})),"success"===this.state.copyingSteps[1].status?s.a.createElement("a",{className:"btn btn-primary",href:"".concat(this.state.datasetUrl)},i.a.translate("".concat(Z,".monitorBtnLabel"))):null):null}},{key:"renderForm",value:function(){var e=O.a.getState().dataprep,t=Object(P.objectQuery)(e,"workspaceInfo","properties","databaseConfig");return s.a.createElement("fieldset",{disabled:!!this.state.error},s.a.createElement("p",null,i.a.translate("".concat(Z,".description"))),s.a.createElement(f.a,{onSubmit:this.handleOnSubmit},s.a.createElement(l.a,{row:!0},s.a.createElement(p.a,{xs:4,className:"text-right"},i.a.translate("".concat(Z,".Form.typeLabel"))),s.a.createElement(u.a,{xs:8},s.a.createElement(d.a,{className:"input-type-group"},s.a.createElement(b.a,{color:"secondary",onClick:this.setType.bind(this,"fileset"),active:"fileset"===this.state.inputType},i.a.translate("".concat(Z,".Form.fileSetBtnlabel"))),s.a.createElement(b.a,{color:"secondary",onClick:this.setType.bind(this,"table"),active:"table"===this.state.inputType,disabled:!D()(t)},i.a.translate("".concat(Z,".Form.tableBtnlabel")))))),s.a.createElement(l.a,{row:!0},s.a.createElement(u.a,{xs:"4"}),s.a.createElement(u.a,{xs:"8"})),s.a.createElement(l.a,{row:!0},s.a.createElement(p.a,{xs:"4",className:"text-right"},i.a.translate("".concat(Z,".Form.datasetNameLabel")),s.a.createElement("span",{className:"text-danger"},"*")),s.a.createElement(u.a,{xs:"6",className:"dataset-name-group"},s.a.createElement("p",{className:"required-label"},i.a.translate("".concat(Z,".Form.requiredLabel")),s.a.createElement("span",{className:"text-danger"},"*")),s.a.createElement(m.a,{value:this.state.datasetName,onChange:this.handleDatasetNameChange}),s.a.createElement(k.default,{id:"dataset-name-info-icon",name:"icon-info-circle"}),s.a.createElement(v.b,{target:"dataset-name-info-icon",delay:{show:250,hide:0}},i.a.translate("".concat(Z,".Form.datasetTooltip"))))),this.renderDatasetSpecificContent()))}},{key:"renderFooter",value:function(){return this.state.error?s.a.createElement(K.b,{type:"DANGER",message:i.a.translate("".concat(Z,".ingestFailMessage")),extendedMessage:this.state.error}):this.state.copyInProgress?void 0:s.a.createElement(g.a,null,s.a.createElement("button",{className:"btn btn-primary",onClick:this.submitForm,disabled:I()(this.state.datasetName)},i.a.translate("".concat(Z,".createBtnLabel"))),s.a.createElement("button",{className:"btn btn-secondary",onClick:this.toggleModal},i.a.translate("features.DataPrep.Directives.cancel")),this.renderSteps())}},{key:"render",value:function(){return s.a.createElement("span",{className:"create-dataset-btn",title:this.props.title},s.a.createElement("button",{className:_()("btn btn-link",this.props.className),onClick:this.toggleModal,disabled:this.props.disabledState},i.a.translate("".concat(Z,".btnLabel"))),s.a.createElement(y.a,{toggle:this.toggleModal,isOpen:this.state.showModal,size:"md",backdrop:"static",zIndex:"1061",className:"cdap-modal dataprep-create-dataset-modal"},s.a.createElement(h.a,null,s.a.createElement("span",null,i.a.translate("".concat(Z,".modalTitle"))),s.a.createElement("div",{className:_()("close-section float-right",{disabled:this.state.copyInProgress&&!this.state.copyTaskStarted&&!this.state.error}),onClick:!this.state.copyInProgress||this.state.copyTaskStarted||this.state.error?this.toggleModal:function(){}},s.a.createElement("span",{className:"fa fa-times"}))),s.a.createElement(j.a,{className:_()({"copying-steps-container":this.state.copyInProgress})},this.state.copyInProgress?this.renderSteps():this.renderForm()),this.renderFooter()))}}])&&W(t.prototype,a),n&&W(t,n),o}(o.Component);Y(ae,"propTypes",{className:r.a.string,disabledState:r.a.bool,title:r.a.string})},855:function(e,t,a){"use strict";var n=a(12),r=a(15),o=a(0),s=a.n(o),c=a(1),i=a.n(c),l=a(3),p=a.n(l),u=a(5),m={tag:u.tagPropType,"aria-label":i.a.string,className:i.a.string,cssModule:i.a.object,role:i.a.string,size:i.a.string,vertical:i.a.bool},f=function(e){var t=e.className,a=e.cssModule,o=e.size,c=e.vertical,i=e.tag,l=Object(r.a)(e,["className","cssModule","size","vertical","tag"]),m=Object(u.mapToCssModules)(p()(t,!!o&&"btn-group-"+o,c?"btn-group-vertical":"btn-group"),a);return s.a.createElement(i,Object(n.a)({},l,{className:m}))};f.propTypes=m,f.defaultProps={tag:"div",role:"group"},t.a=f}}]);