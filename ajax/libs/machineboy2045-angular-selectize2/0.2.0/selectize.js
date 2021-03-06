/**
 * Angular Selectize2
 * https://github.com/machineboy2045/angular-selectize
 **/

angular.module('selectize', []).value('selectizeConfig', {}).directive("selectize", ['selectizeConfig', '$timeout', function(selectizeConfig, $timeout) {

  return {
    restrict: 'A',
    require: '^ngModel',
    link: function(scope, element, attrs, ngModel) {
      var prevModelValue;
      var config = scope.$eval(attrs.selectize);

      if(selectizeConfig){
        config = angular.extend(config, selectizeConfig);
      }
      
      //=============================================================
      // required validation
      //=============================================================
      function validateRequired(value){
        var valid = !attrs.required || (value && value.length);
        ngModel.$setValidity('required', valid);
        return value;
      }
      
      ngModel.$parsers.push(validateRequired)

      //=============================================================
      // setup
      //=============================================================
      config.options = scope[attrs.options];

      //support simple arrays
      var options = [];
      if(config.options && typeof config.options[0] === 'string'){
        angular.forEach(config.options, function(opt){
          options.push({text:opt, value:opt});
        })
        config.options = options;
      }
      
      //initialize
      element.selectize(config);
      var selectize = element[0].selectize;
      
      //=============================================================
      // refresh angular models when selectize changes
      //=============================================================
      function refreshAngularItems(items) {
        $timeout(function(){ 
          if(!config.stringify){
            if(!(items && items.length)){
              items = [];
            }else{
              items = String(items).split(selectize.settings.delimiter);
            }
          }
            
          ngModel.$setViewValue(items);
        },0);
      }
      
      function refreshAngularOptions(value, data) {
        $timeout(function(){ config.options.push(data) },0);
      }
      
      //=============================================================
      // update selectize when angular models change
      //=============================================================
      function refreshSelectize(){
        var items = ngModel.$modelValue;
        if(angular.equals(items, prevModelValue)){
            return;
        }else{
          prevModelValue = items;
        }
        
        
        if(config.stringify)
          items = String(items).split(selectize.settings.delimiter)
        
        //options
        angular.forEach(items, function(opt){
          var newOpt = {};
          newOpt[selectize.settings.valueField] = opt;
          newOpt[selectize.settings.labelField] = opt;
          selectize.addOption(newOpt);
        });
        selectize.refreshOptions(false);
        
        //items
        selectize.setValue(items); 
      }
      

      //=============================================================
      // watchers
      //=============================================================
      selectize.on('change', refreshAngularItems);
      selectize.on('option_add', refreshAngularOptions);
      ngModel.$render = refreshSelectize;
      
    }
  };
}]);