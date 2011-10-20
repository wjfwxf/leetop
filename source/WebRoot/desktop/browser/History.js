
Ext.define('Leetop.browser.History', {
    extend: 'Ext.data.Model',
    fields: [
       { name : 'id'},
       { name : 'http' },
       { name : 'date',  type: 'date', dateFormat: 'timestamp'},
       { name : 'title'}
    ]
});
