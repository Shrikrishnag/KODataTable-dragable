(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'koDataTable', 'dragtable'], factory);
    } else {
        root.amdWeb = factory(root.jQuery, root.KODataTable);
    }
}(this, function ($,  Kodt) {
    "use strict";
    Kodt.prototype.dragtable = function(doptions){
        doptions = $.extend({},this.options, doptions);
        if(!doptions.tableSelector){
            console.error("You must provide a table selector to implement dragtable");
            return;
        }
        var tableSelector = doptions.tableSelector;
        var koTable = this;
        var defaultDragOptions = {
            persistState: function(table) {
                if (!window.localStorage) return;
                var ss = window.localStorage;
                $.each(koTable.columns(),function(i) {
                    if(this.id != '') {table.sortOrder[this.id]=i;}
                });
                ss.setItem(tableSelector + '-tableorder',JSON.stringify(table.sortOrder));
            },
            restoreState: function(){
                var sortOrder = JSON.parse(window.localStorage.getItem(tableSelector +'-tableorder'));
                if(!sortOrder){
                    return;
                }
                koTable.columns.sort(function(left,right){
                    var newleft = sortOrder[left.id];
                    var newright = sortOrder[right.id];
                    return newleft === newright ? 0 : (newleft < newright ? -1 : 1)

                });
            }
        };
        var dragtable = $(tableSelector).dragtable($.extend(defaultDragOptions, doptions)).dragtable("instance");
        koTable.dragtableInstance = dragtable;
        dragtable._bubbleCols = function() {
            var table = dragtable.originalTable;
            var columnsReordered = [];
            var origColumns = [];

            //my version of ko datatables has visibleColumns
            var tmpCols = [];
            if(koTable.visibleColumns){
                origColumns = koTable.visibleColumns();
            } else {
                origColumns = koTable.columns().splice(0);
            }

            if (table.startIndex === table.endIndex) {
                return true;
            } else if (table.startIndex > table.endIndex) {
                $.each(origColumns.splice(0, table.endIndex - 1), function (_, i) {
                    columnsReordered.push(i)
                });
                columnsReordered.push(origColumns[table.startIndex - table.endIndex]);
                $.each(origColumns.splice(0, table.startIndex - table.endIndex), function (_, i) {
                    columnsReordered.push(i)
                });
                $.each(origColumns.splice(1), function (_, i) {
                    columnsReordered.push(i)
                });
            } else {
                $.each(origColumns.splice(0, table.startIndex - 1), function (_, i) {
                    columnsReordered.push(i)
                });
                $.each(origColumns.splice(1, table.endIndex - table.startIndex), function (_, i) {
                    columnsReordered.push(i)
                });
                $.each(origColumns.splice(0), function (_, i) {
                    columnsReordered.push(i)
                });
            }
            koTable.columns.sort(function (left, right) {
                var newleft = columnsReordered.indexOf(left);
                var newright = columnsReordered.indexOf(right);
                if(newleft < 0){
                    newleft = 99999;
                }
                if(newright < 0){
                    newright = 99999;
                }
                return newleft === newright ? 0 : (newleft < newright ? -1 : 1)

            });
            $(window).resize();
        }
    };


    Kodt.prototype.keyDownMoveColumn = function(column, event) {
        var self = this;
        var ARROW_LEFT = 37, ARROW_RIGHT = 39;
        var oldIndex = self.visibleColumns().indexOf(column) + 1;
        var newIndex =  oldIndex;
        if ( event.keyCode === ARROW_LEFT && oldIndex > 1) {
            newIndex = oldIndex - 1;
        } else if ( event.keyCode === ARROW_LEFT && oldIndex === 1){
            newIndex = self.visibleColumns().length;
        } else if(event.keyCode === ARROW_RIGHT && oldIndex < self.visibleColumns().length ){
            newIndex = oldIndex + 1;
        } else if(event.keyCode === ARROW_RIGHT && oldIndex === self.visibleColumns().length ){
            newIndex = 1;
        }
        if(oldIndex !== newIndex){
            self.dragtableInstance.originalTable.startIndex = oldIndex;
            self.dragtableInstance.originalTable.endIndex = newIndex;
            self.dragtableInstance._bubbleCols();
            $(event.currentTarget).focus();
            return false;
        }

        return true;
    };

    return Kodt;
}));