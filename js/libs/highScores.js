define([ 'Kinetic', 'kineticEditableText', 'backbone', 'firebase', 'settings', 'util', 'backfire' ],
    function( Kinetic, kineticEditableText, Backbone, Firebase, settings, util ){
        var stage,
            _s = settings.highScores,
            highScores = {
                add: {
                    name: 'highScores.add',

                    isNotStoppingOrStopped: util.module.isNotStoppingOrStopped,

                    state: new Backbone.Model({ current: 'stopped' }),

                    layer: new Kinetic.Layer,

                    playerName: {
                        lastLength: 0,

                        label: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.name.label.x ),
                            y: util.calculate.absolute.y( _s.name.y ),
                            text: 'Name:',
                            fontSize: util.calculate.absolute.size( _s.name.size ),
                            fontFamily: 'Fira Mono',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        calculate: {
                            field: {
                                x: function() {
                                    return highScores.add.playerName.label.x() +
                                        util.calculate.absolute.x( 3.8 )
                                }
                            }
                        },

                        move: function() {
                            var nameLength = this.field.tempText[ 0 ].text().length;

                            this.label.x(
                                util.calculate.absolute.x( _s.name.label.x ) -
                                    ( nameLength * util.calculate.absolute.x( 40.7 ))
                            );

                            this.field.tempText[ 0 ].x(
                                highScores.add.playerName.calculate.field.x()
                            );

                            this.lastLength = nameLength
                        }
                    },

                    keyboard: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x(_s.add.keyboard.x ),
                            y: util.calculate.absolute.y( _s.add.keyboard.y ),
                            text: '\uf11c',
                            fontSize: util.calculate.absolute.size( _s.add.keyboard.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 3.64 ),
                            y: util.calculate.absolute.y( 1.222 ),
                            width: util.calculate.absolute.size( 7.7 ),
                            height: util.calculate.absolute.size( 12.6 ),
                            opacity: 0
                        })
                    },

                    submit: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.add.submit.x ),
                            y: util.calculate.absolute.y( _s.add.submit.y ),
                            text: '\uf058',
                            fontSize: util.calculate.absolute.size( _s.add.submit.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 2.177 ),
                            y: util.calculate.absolute.y( 1.22 ),
                            width: util.calculate.absolute.size( 12.6 ),
                            height: util.calculate.absolute.size( 12.6 ),
                            opacity: 0
                        })
                    },

                    back: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.add.back.x ),
                            y: util.calculate.absolute.y( _s.add.back.y ),
                            text: '\uf057',
                            fontSize: util.calculate.absolute.size( _s.add.back.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 1.68 ),
                            y: util.calculate.absolute.y( 1.22 ),
                            width: util.calculate.absolute.size( 12.6 ),
                            height: util.calculate.absolute.size( 12.6 ),
                            opacity: 0
                        })
                    },

                    animation: new Kinetic.Animation( function( frame ){
                        var state = highScores.add.state.get( 'current' );

                        if ( state === 'running' )
                            highScores.add.mouseOverCheck( frame );

                        if ( state === 'stopping' )
                            util.module.stop( highScores.add, frame )

                    }),

                    mouseOverCheck: function( frame ){
                        var brightnessVariance = util.calculate.brightnessVariance( frame ),
                            hF = settings.font.colors.fill.enabled.h,
                            sF = settings.font.colors.fill.enabled.s,
                            lF = settings.font.colors.fill.enabled.l - brightnessVariance,
                            hS = settings.font.colors.stroke.enabled.h,
                            sS = settings.font.colors.stroke.enabled.s,
                            lS = settings.font.colors.stroke.enabled.l - brightnessVariance;

                        if ( highScores.add.keyboard.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.add.keyboard.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            });

                        else if ( highScores.add.submit.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.add.submit.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            });

                        else if ( highScores.add.back.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.add.back.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            })
                    },

                    start: function( score ){
                        highScores.add.score = score;

                        highScores.add.background.count( score );

                        highScores.add.playerName.field.focus();

                        util.module.start( highScores.add, stage )
                    },

                    init: function( options ){
                        stage = options.stage;

                        highScores.add.background = options.background.highScores.add;

                        highScores.add.playerName.field = new Kinetic.EditableText({
                            x: highScores.add.playerName.calculate.field.x(),
                            y: util.calculate.absolute.y( _s.name.y ),
                            fontSize: util.calculate.absolute.size( _s.name.size ),
                            fontFamily: 'Fira Mono',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width ),
                            focusLayer: highScores.add.layer,
                            stage: stage
                        });

                        ( function _layer() {
                            highScores.add.layer.add( highScores.add.background.group );

                            highScores.add.layer.add( highScores.add.playerName.label );
                            highScores.add.layer.add( highScores.add.playerName.field );

                            highScores.add.layer.add( highScores.add.keyboard.shape );
                            highScores.add.layer.add( highScores.add.keyboard.hitBox );

                            highScores.add.layer.add( highScores.add.submit.shape );
                            highScores.add.layer.add( highScores.add.submit.hitBox );

                            highScores.add.layer.add( highScores.add.back.shape );
                            highScores.add.layer.add( highScores.add.back.hitBox );

                            highScores.add.animation.setLayers( highScores.add.layer )
                        })()
                    },

                    cleanUp: function() {
                        highScores.add.score = 0;

                        highScores.add.playerName.field.text( '' );
                        highScores.add.playerName.field.unfocus();
                        highScores.add.playerName.move();

                        highScores.add.submit.mouseOver = false;
                        highScores.add.back.mouseOver = false;

                        highScores.add.submit.shape.fill( settings.font.colors.fill.enabled.hex );
                        highScores.add.back.shape.fill( settings.font.colors.fill.enabled.hex )
                    }
                },

                view: {
                    name: 'highScores.view',

                    isNotStoppingOrStopped: util.module.isNotStoppingOrStopped,

                    state: new Backbone.Model({ current: 'stopped' }),

                    layer: new Kinetic.Layer,

                    index: 0,

                    playerName: {
                        label: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.name.label.x ),
                            y: util.calculate.absolute.y( _s.name.y ),
                            text: 'Name:',
                            fontSize: util.calculate.absolute.size( _s.name.size ),
                            fontFamily: 'Fira Mono',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        scoreHolder: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.name.scoreHolder.x ),
                            y: util.calculate.absolute.y( _s.name.y ),
                            text: 'Name:',
                            fontSize: util.calculate.absolute.size( _s.name.size ),
                            fontFamily: 'Fira Mono',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        calculate: {
                            scoreHolder: {
                                x: function() {
                                    return highScores.view.playerName.label.x() + util.calculate.absolute.x( 3.8 )
                                }
                            }
                        },

                        move: function() {
                            var nameLength = highScores.view.current.get( 'name' ).length;

                            this.label.x(
                                util.calculate.absolute.x( _s.name.label.x ) -
                                    ( nameLength * util.calculate.absolute.x( 40.7 ))
                            );

                            this.scoreHolder.x(
                                highScores.view.playerName.calculate.scoreHolder.x()
                            )
                        }
                    },

                    previous: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.view.previous.x ),
                            y: util.calculate.absolute.y( _s.view.previous.y ),
                            text: '\uf060',
                            fontSize: util.calculate.absolute.size( _s.view.previous.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 3.02 ),
                            y: util.calculate.absolute.y( 1.222 ),
                            width: util.calculate.absolute.size( 13.2 ),
                            height: util.calculate.absolute.size( 12.5 ),
                            opacity: 0
                        })
                    },

                    back: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.view.back.x ),
                            y: util.calculate.absolute.y( _s.view.back.y ),
                            text: '\uf057',
                            fontSize: util.calculate.absolute.size( _s.view.back.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 2.177 ),
                            y: util.calculate.absolute.y( 1.22 ),
                            width: util.calculate.absolute.size( 12.6 ),
                            height: util.calculate.absolute.size( 12.6 ),
                            opacity: 0
                        })
                    },

                    next: {
                        mouseOver: false,

                        shape: new Kinetic.Text({
                            x: util.calculate.absolute.x( _s.view.next.x ),
                            y: util.calculate.absolute.y( _s.view.next.y ),
                            text: '\uf061',
                            fontSize: util.calculate.absolute.size( _s.view.next.size ),
                            fontFamily: 'FontAwesome',
                            fill: settings.font.colors.fill.enabled.hex,
                            stroke: settings.font.colors.stroke.enabled.hex,
                            strokeWidth: util.calculate.absolute.size( settings.font.stroke.width )
                        }),

                        hitBox: new Kinetic.Rect({
                            x: util.calculate.absolute.x( 1.681 ),
                            y: util.calculate.absolute.y( 1.222 ),
                            width: util.calculate.absolute.size( 13.2 ),
                            height: util.calculate.absolute.size( 12.5 ),
                            opacity: 0
                        })
                    },

                    animation: new Kinetic.Animation( function( frame ){
                        var state = highScores.view.state.get( 'current' );

                        if ( state === 'starting' ){
                            highScores.view.update();

                            highScores.view.state.set( 'current', 'running' )

                        } else if ( state === 'running' ){
                            highScores.view.mouseOverCheck( frame )

                        } else if ( state === 'stopping' ){
                            util.module.stop( highScores.view, frame )
                        }
                    }),

                    mouseOverCheck: function( frame ){
                        var brightnessVariance = util.calculate.brightnessVariance( frame ),
                            hF = settings.font.colors.fill.enabled.h,
                            sF = settings.font.colors.fill.enabled.s,
                            lF = settings.font.colors.fill.enabled.l - brightnessVariance,
                            hS = settings.font.colors.stroke.enabled.h,
                            sS = settings.font.colors.stroke.enabled.s,
                            lS = settings.font.colors.stroke.enabled.l - brightnessVariance;

                        if ( highScores.view.previous.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.view.previous.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            });

                        else if ( highScores.view.next.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.view.next.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            });

                        else if ( highScores.view.back.mouseOver )
                            util.color.fillAndStroke({
                                node: highScores.view.back.shape,
                                fill: { h: hF, s: sF, l: lF },
                                stroke: { h: hS, s: sS, l: lS }
                            })
                    },

                    update: function() {
                        highScores.view.current = highScores.database.scores.at( highScores.view.index );

                        highScores.view.background.count( highScores.view.current.get( 'score' ));

                        highScores.view.playerName.scoreHolder.text( highScores.view.current.get( 'name' ));

                        highScores.view.playerName.move();

                        if ( highScores.view.index === 0 ){
                            highScores.view.previous.shape.remove();
                            highScores.view.previous.hitBox.remove()

                        } else if ( highScores.view.index === highScores.database.scores.length - 1 ){
                            highScores.view.next.shape.remove();
                            highScores.view.next.hitBox.remove()
                        }

                        if ( highScores.view.index > 0 && !highScores.view.previous.shape.getParent() ){
                            highScores.view.layer.add( highScores.view.previous.shape );
                            highScores.view.layer.add( highScores.view.previous.hitBox )
                        }

                        if ( highScores.view.index < highScores.database.scores.length - 1 &&
                             !highScores.view.next.shape.getParent() ){

                            highScores.view.layer.add( highScores.view.next.shape );
                            highScores.view.layer.add( highScores.view.next.hitBox )
                        }
                    },

                    init: function( options ){
                        highScores.view.background = options.background.highScores.view;

                        ( function _layer() {
                            highScores.view.layer.add( highScores.view.background.group );

                            highScores.view.layer.add( highScores.view.playerName.label );
                            highScores.view.layer.add( highScores.view.playerName.scoreHolder );

                            highScores.view.layer.add( highScores.view.previous.shape );
                            highScores.view.layer.add( highScores.view.previous.hitBox );

                            highScores.view.layer.add( highScores.view.next.shape );
                            highScores.view.layer.add( highScores.view.next.hitBox );

                            highScores.view.layer.add( highScores.view.back.shape );
                            highScores.view.layer.add( highScores.view.back.hitBox );

                            highScores.view.animation.setLayers( highScores.view.layer )
                        })()
                    },

                    cleanUp: function() {
                        highScores.view.index = 0;

                        highScores.view.back.mouseOver = false;

                        highScores.view.back.shape.fill( settings.font.colors.fill.enabled.hex )
                    }
                },

                init: function( options ){
                    highScores.database = {
                        Score: Backbone.Model.extend({
                            defaults: function() {
                                return {
                                    time: new Date().getTime()
                                }
                            },

                            initialize: function() {
                                if ( !this.get( 'name' ))
                                    throw new Error( 'A name must be provided when initializing ' +
                                                     'a highScores.database.Score' );

                                if ( !this.get( 'score' ))
                                    throw new Error( 'A score must be provided when initializing ' +
                                                     'a highScores.database.Score' )
                            }
                        }),

                        submitScore: function() {
                            if ( highScores.add.playerName.field.text().length > 0 ){
                                highScores.database.scores.add(
                                    new highScores.database.Score({
                                        score: highScores.add.score,
                                        name: highScores.add.playerName.field.text()
                                    })
                                );

                                highScores.add.state.set( 'current', 'stopping' )

                            } else alert( 'Please provide your name, or click the "X" icon ' +
                                          'if you do not wish to record your high score.' )
                        },

                        waitUntilConnected: function wait( cb ){
                            if ( highScores.database.scores.at( 0 )) cb();
                            else setTimeout( wait, 100, cb )
                        },

                        init: function() {
                            highScores.database.TopScores = Backbone.Firebase.Collection.extend({
                                model: highScores.database.Score,

                                firebase: new Firebase( _s.database ).limit( _s.limit ).endAt(),

                                comparator: function( model ){
                                    return -model.get( 'score' )
                                }
                            });

                            highScores.database.scores = new highScores.database.TopScores
                        }
                    };

                    kineticEditableText.init( Kinetic );

                    highScores.database.init();

                    highScores.add.init( options );

                    highScores.view.init( options )
                }
            };

        return highScores
    }
);