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
                if (!window.sessionStorage) return;
                var ss = window.sessionStorage;
                $.each(koTable.columns(),function(i) {
                    if(this.id != '') {table.sortOrder[this.id]=i;}
                });
                ss.setItem(tableSelector + '-tableorder',JSON.stringify(table.sortOrder));
            },
            restoreState: function(){
                var sortOrder = JSON.parse(window.sessionStorage.getItem(tableSelector +'-tableorder'));
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
        dragtable._bubbleCols = function() {
            var table = dragtable.originalTable;
            var columnsReordered = [];
            var origColumns = [];
            $.each(koTable.columns(), function (_, i) {
                origColumns.push(i)
            });
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
                return newleft === newright ? 0 : (newleft < newright ? -1 : 1)

            });
        }
    };
    return Kodt;
}));