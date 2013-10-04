
var ParticipantsComponent = (function(){


	var MyClass = UnmanagedComponent.extend({

		_modelClass: undefined, 
		_viewClass: undefined,
		_template: undefined,

	  _modelsMap: undefined,
	  _models: undefined,
	  _views: undefined,
	  _viewsMap: undefined,
	  _hiddenViews: undefined,
	  _positions: undefined,

	  _addIns: [ ],

	  _hasRunInit: false,

		update: function() {
			this.init();
			this.clean();
			this.initModels();
			this.initViews();

		  this.ph = $("#" + this.htmlObject);
		  var callback = _.bind(this.render,this);
	    this.triggerQuery( this.chartDefinition , callback );
		},

		init: _.once( function(){
			this._modelClass = this._modelClass || wd.cdf.models.participantCard;
			this._viewClass = this._viewClass  || wd.cdf.views.participantCard;
			this._template = this._template || wd.cdf.templates.participantCard;

			if( _.isString(this._template) ){  this._template = Mustache.compile( this._template ) }
		}),

		clean: function (){
			if (this._models){
				this._models.each( function(model){
					model.destroy();
				});
			}
		},

		initModels: function (){
			this._models = new Backbone.Collection([],{
  			model: this._model
			});
			this._modelsMap = {};
		},

		initViews: function(){
			this._views = [];
			this._hiddenViews = [];
			this._positions = [];
			this._viewsMap = {};
		},

		// construct plugins info based on query data
	  render: function (data){
	  	var cards = {},
	  			myself = this;
	  	this._keyMap = _.pluck( data.metadata, 'colName' );
	  	this._data = data;
	  	this._idxMap = {};
	  	_.each( data.metadata, function (el){
	  		myself._idxMap[el.colName] = el.colIndex;
	  	});
	  	_.each( data.resultset, function(row, rowIdx){
	  		var card = { rowIdx: rowIdx };
	  		_.each(row, function(cell, colIdx){
	  			card[myself._keyMap[colIdx]] = cell;
	  		});
	  		card.id = card.id || _.uniqueId('__modelId__');
	  		cards[card.id] = card;
	  	});
	  	this.draw(cards);
	  },

	  draw: function(cards) {
			$('#'+this.htmlObject).empty();

	    var cd = this.chartDefinition,
	    	  myself = this;

	    /* Initialize  Cards models and views */
  		_.each( cards , function(c){
		    if( !myself.hasModel(c.id) ){
  				myself.addModel( c.id,  new myself._modelClass( c ) );
  		  } else {
  				myself.getModel(c.id).set( c );
  		  }

  		  myself.addView( c.id, new myself._viewClass({
  				model: myself.getModel(c.id),
  				tagName:'div',
  				template: myself._template
  		  }));
  		});

  		_.each( this.getViews() , function(v){
  			v.render( '#' + myself.htmlObject );
  		});
  		this.getPositions();
  		this.setPositions();

  		this.configureListeners();

  		this.handleAddIns();

	  },

	  selectFirstCard: function (){
	  	var views = this.getViews();
	  	if ( !_.isEmpty(views) ){ views[0].selectCard() };
	  },

	  hasModel: function (name){ return !!this._modelsMap[name]; },
	  addModel: function (name, m){ this._modelsMap[name] = m; this._models.add(m); },
	  getModel: function (name){ return name ? this._modelsMap[name] : undefined; },
	  getModels: function(){ return this._models },
	  getModelsMap: function(){ return this._modelsMap },

	 	hasView: function(name){	return !!this._views[name]; },
	  addView: function (name, v){ this._viewsMap[name]=v; this._views.push(v); },
	  getView: function (name){ return name ? this._views[name] : undefined ; },
	  getViews: function (){ return this._views},

		configureListeners: function (){
			var myself = this;
			this.getModels().on('startTheFun', function (){
				myself.startTheFun(120,1);
				myself.startPopping(500,0.2)
			});
		},

		startTheFun: function (duration, delta){
			var myself = this;
			this.shuffle();
			if ( this._views.length > 1 && duration > 0){
				setTimeout( function (){
					myself.startTheFun( duration - delta, delta);
				}, delta * 1000);
			} 
		},

		startPopping: function (duration, delta){
			var myself = this;
			this.popView();
			if ( this._views.length <= 1){
				_.first( this._views).$el.addClass('immortal');
			} else if ( duration > 0){
				setTimeout( function (){
					myself.startPopping( duration - delta, delta);
				}, delta * 1000);
			} 
		},

		getPositions: function (){
			var myself = this;
			_.each( this.getViews() , function(v){
				myself._positions.push( v.$el.position() );	
			});
		},

		setPositions: function (){
			var myself = this;
			_.each( this.getViews() , function(v, idx){
				var pos = myself._positions[idx];
				v.$el.css({
					top: pos.top + 'px',
					left: pos.left + 'px',
					position:'absolute'
				});
				
			});
		},

		getValue: function (){
			
		},

		shuffle: function (){
			this._views = _.shuffle( this._views );
			this.setPositions();
		},

		popView: function(){
			var poppedView = this._views.pop();
			this._positions.pop();
			this._hiddenViews.push( poppedView );

			poppedView.$el.css({
				top: '-400px',
				position: 'absolute'
			});
		},

		handleAddIns: function (){
			var myself = this;

			_.each( this.getViews(), function(v){
				var state = {
					rawData: myself._data,
					tableData: myself._data.resultset,
					rowIdx: v.model.get('rowIdx'),
					id: v.model.get('id')
				};

				_.each( myself.addIns , function(a){
					var addIn = Dashboards.getAddIn('Table', 'colType', a.addIn);
					state.colIdx = myself._idxMap[a.property];
					state.value = v.model.get(a.property);
					state.target = v.$el.find(a.selector);

					addIn.call( state.target, state, myself.getAddInOptions('colType', addIn.getName() ));
				});

			});
		}

	});

	return MyClass
})();
