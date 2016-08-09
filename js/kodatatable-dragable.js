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
            persistState: function() {
                var sortOrder = {};
                if (!window.localStorage) return;
                var ss = window.localStorage;
                $.each(koTable.columns(),function(i) {
                    if(this.id != '') {sortOrder[this.id]=i;}
                });
                ss.setItem(tableSelector + '-tableorder',JSON.stringify(sortOrder));
            },
            restoreState: function(){
                var sortOrder = JSON.parse(window.localStorage.getItem(tableSelector +'-tableorder'));
                if(!sortOrder){
                    return;
                }
                koTable.columns.sort(function(left,right){
                    var newleft = sortOrder[left.id];
                    var newright = sortOrder[right.id];
                    return newleft === newright ? 0 : (newleft < newright ? -1 : 1);

                });
            }
        };
        var dragtable = $(tableSelector).dragtable($.extend(defaultDragOptions, doptions)).dragtable("instance");
        koTable.dragtableInstance = dragtable;
        dragtable._bubbleCols = function(startEndVisibilityAccountedFor) {
            var table = dragtable.originalTable;
            var columnsReordered = [];
            var origColumns = [];

            //my version of ko datatables has visibleColumns
            var startIndex = table.startIndex;
            var endIndex = table.endIndex;
            if(!startEndVisibilityAccountedFor && koTable.visibleColumns) {
                startIndex = koTable.columns().indexOf(koTable.visibleColumns()[startIndex-1])+1;
                endIndex = koTable.columns().indexOf(koTable.visibleColumns()[endIndex-1])+1;
            }

            var origColumns = koTable.columns().slice(0);


            if (startIndex === endIndex) {
                return true;
            } else if (startIndex > endIndex) {
                $.each(origColumns.splice(0, endIndex - 1), function (_, i) {
                    columnsReordered.push(i);
                });
                columnsReordered.push(origColumns[startIndex - endIndex]);
                $.each(origColumns.splice(0, startIndex - endIndex), function (_, i) {
                    columnsReordered.push(i);
                });
                $.each(origColumns.splice(1), function (_, i) {
                    columnsReordered.push(i);
                });
            } else {
                $.each(origColumns.splice(0, startIndex - 1), function (_, i) {
                    columnsReordered.push(i);
                });
                $.each(origColumns.splice(1, endIndex - startIndex), function (_, i) {
                    columnsReordered.push(i);
                });
                $.each(origColumns.splice(0), function (_, i) {
                    columnsReordered.push(i);
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
        };
        return dragtable;
    };


    Kodt.prototype.keyDownMoveColumn = function(column, event) {
        var self = this;
        var ARROW_LEFT = 37, ARROW_RIGHT = 39;
        if((column.visible !== undefined && column.visible() === false) || (column.alwayHidden === undefined && ko.unwrap(column.alwaysHidden) === true)){
            return true;
        }
        if ( event.keyCode === ARROW_LEFT) {
            self.moveColumnLeft(column, event, true);
            return false;
        } else if(event.keyCode === ARROW_RIGHT) {
            self.moveColumnRight(column, event, true);
            return false;
        }

        return true;
    };

    Kodt.prototype.nextVisibleNonHiddenColumn = function(column){
        var self = this;
        var origIndex = self.columns.indexOf(column);
        for(var i = origIndex+1; i !== origIndex; i++){
            if(i === self.columns().length){
                i = 0;
            }
            if(i === origIndex){
                return origIndex;
            }
            var tmpColumn = self.columns()[i];
            if((tmpColumn.visible === undefined || tmpColumn.visible()) && (tmpColumn.alwaysHidden === undefined || ko.unwrap(tmpColumn.alwaysHidden) === false) ){
                return i;
            }
        };
        return origIndex;
    };

    Kodt.prototype.nextNonHiddenColumn = function(column){
        var self = this;
        var origIndex = self.columns.indexOf(column);
        for(var i = origIndex+1; i !== origIndex; i++){
            if(i === self.columns().length){
                i = 0;
            }
            if(i === origIndex){
                return origIndex;
            }
            var tmpColumn = self.columns()[i];
            if(tmpColumn.alwaysHidden === undefined || ko.unwrap(tmpColumn.alwaysHidden) === false ){
                return i;
            }
        };
        return origIndex;
    };

    Kodt.prototype.previousVisibleNonHiddenColumn = function(column){
        var self = this;
        var origIndex = self.columns.indexOf(column);
        for(var i = origIndex-1; i !== origIndex; i--){
            if(i === -1){
                i = self.columns().length - 1;
            }
            if(i === origIndex){
                return origIndex;
            }
            var tmpColumn = self.columns()[i];
            if((tmpColumn.visible === undefined || tmpColumn.visible()) && (tmpColumn.alwaysHidden === undefined || ko.unwrap(tmpColumn.alwaysHidden) === false) ){
                return i;
            }
        };
        return origIndex;
    };

    Kodt.prototype.previousNonHiddenColumn = function(column){
        var self = this;
        var origIndex = self.columns.indexOf(column);
        for(var i = origIndex-1; i !== origIndex; i--){
            if(i === -1){
                i = self.columns().length - 1;
            }
            if(i === origIndex){
                return origIndex;
            }
            var tmpColumn = self.columns()[i];
            if(tmpColumn.alwaysHidden === undefined || ko.unwrap(tmpColumn.alwaysHidden) === false ){
                return i;
            }
        };
        return origIndex;
    };

    Kodt.prototype.moveColumnRight = function(column, event, visible) {
        var self = this;
        var oldIndex = self.columns().indexOf(column) + 1;
        var newIndex = oldIndex;
        if(visible){
            newIndex =  self.nextVisibleNonHiddenColumn(column) + 1;
        } else {
            newIndex = self.nextNonHiddenColumn(column) + 1;
        }

        self.dragtableInstance.originalTable.startIndex = oldIndex;
        self.dragtableInstance.originalTable.endIndex = newIndex;
        self.dragtableInstance._bubbleCols(true);
        self.dragtableInstance.options.persistState();
        $(event.currentTarget).focus();

        return true;
    };
    Kodt.prototype.moveColumnLeft = function(column, event, visible) {
        var self = this;
        var oldIndex = self.columns().indexOf(column) + 1;
        var newIndex = oldIndex;
        if(visible){
            newIndex =  self.previousVisibleNonHiddenColumn(column) + 1;
        } else {
            newIndex = self.previousNonHiddenColumn(column) + 1;
        }

        self.dragtableInstance.originalTable.startIndex = oldIndex;
        self.dragtableInstance.originalTable.endIndex = newIndex;
        self.dragtableInstance._bubbleCols(true);
        self.dragtableInstance.options.persistState();
        $(event.currentTarget).focus();

        return true;
    };

    return Kodt;
}));