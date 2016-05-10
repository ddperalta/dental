angular.module('app.controllers', [])
  
.controller('miPerfilCtrl', function($scope, $http, $state, $localStorage) {

	if ( !$localStorage.login_data ) {
		$state.go('quiroDental');
	} 

	if ( $localStorage.profile && 
		 $localStorage.profile.id == $localStorage.login_data.id_profile ) {
		$scope.profile = $localStorage.profile;
	} else {
		var req = {
			method: 'GET',
			url: 'http://dental.peralta.be/profile/view/'+$localStorage.login_data.id_profile+'.json'
		};
		
		$http(req).then(function(result) {
			$scope.profile = result.data.profile;
			var diff = new Date() - new Date($scope.profile.birthday);
			$scope.profile.age = Math.ceil(diff / (1000 * 3600 * 24 * 365)); 
			$scope.profile.birthday_string = moment($scope.profile.birthday).add(1,'day').format('DD MMMM');
			$localStorage.profile = $scope.profile;
		});
		$localStorage.profile = $scope.profile;
	};
})
   
.controller('cartTabDefaultPageCtrl', function($scope) {
	//get dates byUserID
	//filter > now + 2h
	//sendmail at confirm

})
   
.controller('historialCtrl', function($scope) {
	//get dates byUserID
	//filter < now + 2h
	//sendmail at rate
})
      
.controller('quiroDentalCtrl', function($scope, $http, $state, $localStorage) {
	$scope.$storage = $localStorage.$default({
	    login_data : {},
	    units: [],
	    doctors: []
	});
	//get and store doctors
	//get and store units

	$scope.login_data = $scope.$storage.login_data;
	$scope.login_data.pass = '';

	$scope.login = function() {
		var user = $scope.login_data.username;
		var pass = $scope.login_data.pass;
		var req = {
			method: 'GET',
			url: 'http://dental.peralta.be/user/login.json?username='+user+'&pass='+pass
		}
		
		$http(req)
            .then(function(response) {
            	if (response.data.user.length > 0) {
            		$scope.login_data = response.data.user[0];
            		$localStorage.login_data = $scope.login_data;
            		$state.go('tabsController.miPerfil');
            	} else {
            		$scope.login_data = {
            			username: '',
            			pass: '',
            			profile_id: 0
            		}
            	};
            });
	};

})
 