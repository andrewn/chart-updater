(function(){
  
  var $,
      glow,
      CHART_ITEM_TEMPLATE,
      ANIM_THRESHOLD = 5, // Don't animated if there are more than this number of items
      ANIM_DURATION  = 0.5,
      tmpl;  
  
  gloader.load([ 'glow', '1', 'glow.dom' ], {
    
    onLoad: function(g) {
      glow  = g;
      $     = glow.dom.get;
      
      // We store the template for chart items in the 
      // HTML document. Need it as a string.
      CHART_ITEM_TEMPLATE = $( '#chart-item-template' ).html();
      
      tmpl = createTemplater( CHART_ITEM_TEMPLATE );
      
      bbc.fmtj.net.json.model.registerRenderer( function(){
        
        var renderer = bbc.fmtj.net.json.renderer.createRendererBase( 'chartRenderer' );

        renderer.render = function ( id, data ) {
                    
          var selector  = '.' + id + ' ol', 
              items     = data.RECORD,
              nodes     = new glow.dom.NodeList();
          
          if ( items.length > 0 ) {
            // For every item in the data
            glow.lang.map( items, function(item) {
              
              var node;
              
              item[ 'id' ]                = 'chart-' + item['position'];
              item[ 'isPreviewable' ]     = 'previewable';
              item[ 'statusAsClassName' ] = item[ 'status' ].replace( '-', '_' );
              item[ 'positionGroup' ]     = function ( pos ) {
                                              if ( pos > 10 ) {
                                                return 'topforty';
                                              } else if ( pos > 1 && pos <= 10 ) {
                                                return 'topten';
                                              } else if ( pos == 1 ) {
                                                return 'number1';
                                              }
                                            }( item['position'] );
                                            
              if ( item[ 'positionGroup' ] != 'number1' ) {
                item[ 'imageUrl' ] = 'http://open.live.bbc.co.uk/dynamic_images/radio1_70x70/www.bbc.co.uk' + item[ 'artwork' ];
              } else {
                item[ 'imageUrl' ] = item[ 'artwork' ];
              }
              
              node = tmpl( item );
              nodes.push( node );
            });
          } // end if
                     
          // Insert nodes into chart list
          var chartList     = $( selector ),
              currentItems  = chartList.children(),
              anims         = [];
          
          // Need to go through backwards
          for ( var i = nodes.length - 1 , len = 0; i >= len; i-- ) {
            var item        = $( nodes[i] ),
                isItemInDom = ( chartList.get( '#' + item.attr('id') ).length > 0 ) ? true : false;
                            
            if( !isItemInDom ) {
              
              chartList.prepend( item );
              
              var originalHeight = item.height();
                          
              item.css('height', 0)
                  .css('opacity', 0);

              var anim = glow.anim.css( 
                item, 
                ANIM_DURATION, {
                'height'  : { from: 0, to: originalHeight },
                'opacity' : { from: 0, to: 1 } 
              });
              
              // Store values on the anim object 
              // in case we don't run it later.
              anim._fmtj_originalHeight = originalHeight;
              anim._fmtj_item           = item;
              
              // Store anim for later running
              anims.push( anim );
            } // end if            
          } // end for 
          
          /*
            We now have all the items inserted into 
            the list. Need to decide how to show them.
            If there's a few then we run the animations
            one after the other.
            If there's more than ANIM_THRESHOLD then we
            show them instantly.
          */
          if ( anims.length > ANIM_THRESHOLD ) {
            // Just show all instantly
            glow.lang.map( anims, function ( anim ) {
              // We've stored info about the items 
              // on the anim object
              var item   = anim._fmtj_item,
                  height = anim._fmtj_originalHeight;
              item.css('height', height + 'px')
                  .css('opacity', 1);
            });
          } else {
            // Apply all animations for the new items
            // one after the other
            new glow.anim.Timeline( anims ).start();
          }
          
        } // end render()
        
        return renderer;
      });
      
      /*
        Creates a function that'll do some templating,
        and create a DOM element given a data object.
        
        Usage: 
          // Call this once
          var tmpl = createTemplater( "<div>{name}</div>" );
          
          // Then call this as many times as you like
          tmpl( { name: 'Andrew' });
              --> Returns <div>Andrew</div>
              
          tmpl( { name: 'Imhotep' });
              --> Returns <div>Imhotep</div>
        
        Depends: 
          - glow.dom.create 
          - glow.lang.interpolate.
      */
      function createTemplater( template ) {
        // Return a function that can be reused
        return function ( data ) {
          var el = glow.dom.create( template, {
            interpolate: data
          });
          return el;
        }
      }
    
    }
  
  });
  
})();

