/*
 * Selector Model describes the behaviour for the selector
 * as a whole.
 */



/*
 model.on('action:delete' , function(id){
 Dashboards.log('Deleting plugin ' + id);
 });**/




var wd = wd || {};
wd.cdf = wd.cdf || {};

(function (namespace) {


    namespace.models = namespace.models || {};
    namespace.views = namespace.views || {};

    namespace.templates = namespace.templates || {};


    /*
     * Models
     */

    var _colorPalette = [ "#e6b313" , "#ed5825" , "#ed2556" , "#0fb63a" , "#5825ed" ];


    namespace.models.participantCard = Backbone.Model.extend({
        defaults:{
            fullName:undefined,
            email:undefined,
            tickets:undefined
        },

        initialize: function (){
        },

        iAmImortal: function (){
            this.trigger('iAmImortal', this.get('email'));
        },

        startTheFun: function (){
            this.trigger('startTheFun');
        }

    });


    /*
     * Templates
     */

    namespace.templates.participantCard  = Mustache.compile(
        "<div class='fullName'>{{fullName}}</div>"

    );

    /*
     * Views
     */

    namespace.views.participantCard = Backbone.View.extend({
        tagName: 'div',
        className: 'participantCardContainer',
        events:{

            "click " : "handleClick"

        },


        initialize: function (opts){
            if( opts.template){
                this.template = opts.template;
            }
        },
        render: function (ph){

            this.$el.html( this.template( this.model.toJSON()) );

            this.appendView(ph);

            this.$el.css( 'background', _.first( _.shuffle( _colorPalette)));

        },

        appendView: function(ph){
            if (ph){
                this.$ph = $(ph);
            }
            if (this.$ph){
                this.$ph.append(this.$el);
            }
            return this
        },

        handleClick: function (){
            if (this.$el.hasClass('immortal')){
                this.model.iAmImortal();
            } else {
                this.model.startTheFun();
            }


        }

    });

}) (wd.cdf);
