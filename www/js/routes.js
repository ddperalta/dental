angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

  .state('tabsController.miPerfil', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/miPerfil.html',
        controller: 'miPerfilCtrl'
      }
    }
  })

  .state('tabsController.cartTabDefaultPage', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/cartTabDefaultPage.html',
        controller: 'cartTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController.historial', {
    url: '/historial',
    views: {
      'tab3': {
        templateUrl: 'templates/historial.html',
        controller: 'historialCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('quiroDental', {
    url: '/login',
    templateUrl: 'templates/quiroDental.html',
    controller: 'quiroDentalCtrl'
  })

$urlRouterProvider.otherwise('/login')

  

});