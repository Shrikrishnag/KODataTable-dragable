# KODataTable-dragable
Plugin for KODataTable(by Mike Allison) that incorporates elements of dragtable (by akottr) to make tables with dynamic rows have easily reordered columns.

This module assumes you want to persist the order of the columns between visits on the browser.

#Dependencies
* [KODataTable](https://github.com/mike-allison/KODataTable)
* [dragtable](https://github.com/akottr/dragtable)
* [jquery-ui 1.11+](https://jqueryui.com/)

Each of these have dependencies
* KODataTable depends on knockout,jquery, and optionally jquery.jTableScroll
* dragtable depends on jquery and jquery-ui

#General Usage

This plugin assumes you are going to organize your knockout view table like below. Specifically you..

* id your table (dragable-table below) and set it to 'tableSelector' in view model
* id each of your columns in the view model
* your tbody iterates over rows then/columns


##HTML

```
    <div id='kodt'>
        <table id="dragable-table">
            <thead>
                <tr data-bind="foreach: {data: koTable.columns, as: 'column'}">
                    <th data-bind="text: column.text, attr:{id: column.id}"></th>
                </tr>
            </thead>
            <tbody data-bind="foreach: {data: koTable.currentRows, as: 'row'}">
                <tr data-bind="foreach: {data: $root.koTable.columns, as: 'column'}">
                    <td data-bind="text: row[column.id]" style="cursor: pointer"></td>
                </tr>
            </tbody>
        </table>
    </div>
```

##Knockout view model

```
    <script>
        var viewModel = {};
        var options = {
            tableSelector: '#dragable-table',
            columns:[
                {id:'id', text: 'ID'},
                {id:'name', text: 'Name'},
                {id: 'description', text: 'Pretty Description'}
            ],
            rows:[
                {id: 1, name: 'beer yum', description: 'only the finest hops and natural flavors'},
                {id:2, name: 'beer ok', description: 'mixture of ok hops and yellow dye #3'},
                {id: 3, name: 'beer bad', description: 'made of toenail trimmings and yeast procured from body armpits'}
            ],
            // other kodatatable options
            dragtable:{
                dragaccept:'.accept'
                //other dragtable options
            }
        }
        viewModel.koTable = new KODataTable(options);
        viewModel.addableRow = {
            id: ko.observable(''),
            name: ko.observable(''),
            description: ko.observable('')
            };
        viewModel.addRow = function(){
            var newOne = viewModel.addableRow;
            viewModel.koTable.rows.push({id: newOne.id(), name:newOne.name(), description:newOne.description()});
        }
        ko.applyBindings(viewModel, document.getElementById("kodt"));
        $('dragable-table').dragtable();
    </script>

```




