angular.module('app.controllers', [])
  
.controller('miPerfilCtrl', function($scope, $http, $state, $localStorage) {
	angular.element(document).ready(function () {

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
				var diff = new Date() - new Date($scope.profile.birthday.slice(0,19));
				$scope.profile.age = Math.ceil(diff / (1000 * 3600 * 24 * 365)); 
				$scope.profile.birthday_string = moment($scope.profile.birthday).add(1,'day').format('DD MMMM');
				$localStorage.profile = $scope.profile;
			});
		};
    });
})
   
.controller('cartTabDefaultPageCtrl', function($scope, $localStorage, $http) {
	$scope.goMap = function (lat, lon) {
			if (ionic.Platform.isIOS()) {
				 window.location.href = "maps://maps.apple.com/?q=" + lat + "," + lon;
			} else {
				window.location.href = "maps://maps.google.com/?q=" + lat + "," + lon;

			}
		};

	$scope.historial = [];

	url = 'http://dental.peralta.be/dental-date/getByUserID.json?userID='+$localStorage.login_data.id;
	$http({method:'GET', url:url}).then(function(result) {
		$scope.historial = _.filter(result.data.dentalDate, function(i) {

			var isFuture = new Date(i.in_date.slice(0,19)) > new Date();
			i.in_date = moment(i.in_date).format('DD MMMM - HH:mm');
			i.latitude = '19.2992064';
			i.longitude = '-99.157939';
			i.location = _.find($localStorage.units, function (j) {
				return j.id == i.id_unit;
			});
			return isFuture;
		});


	});
	//sendmail at confirm
	var url = '';
})
   
.controller('historialCtrl', function($scope, $localStorage, $http) {
	$scope.historial = [];

	url = 'http://dental.peralta.be/dental-date/getByUserID.json?userID='+$localStorage.login_data.id;
	$http({method:'GET', url:url}).then(function(result) {
		$scope.historial = _.filter(result.data.dentalDate, function(i) {

			var isFuture = new Date(i.in_date.slice(0,19)) < new Date();
			i.in_date = moment(i.in_date).format('DD MMMM - HH:mm');
			i.doctor = _.find($localStorage.doctors, function(j) {return j.id == i.id_doc}).name;
			return isFuture;
		});
	});
	var url = '';
	//sendmail at rate
})
      
.controller('quiroDentalCtrl', function($scope, $http, $state, $localStorage, $q) {
	$localStorage.$reset();
	$scope.$storage = $localStorage.$default({
	    login_data : {},
	    units: [],
	    doctors: []
	});
	
	//TODO make API route for /doc's profiles 
	var url_doctors = 'http://dental.peralta.be/user.json';
	var url_profiles = 'http://dental.peralta.be/profile.json';
	var url_units = 'http://dental.peralta.be/unit.json';

	$http({method:'GET', url: url_units})
		.then(function(result) {
			$localStorage.units = result.data.unit;
			return $http({method:'GET', url: url_doctors});
		})
		.then(function(result) {
			var doctors = _.filter(result.data.user, function(u) { return u.role == 'doc' });
			$localStorage.doctors = doctors;
			return $http({method: 'GET', url: url_profiles});
		})
		.then(function(result) {
			var ids = _.pluck($localStorage.doctors, 'id_profile');
			var profiles = _.filter(result.data.profile, function (u) { return _.indexOf(ids,u.id) >= 0 });
			$localStorage.doctors = profiles;
		});
	
	$scope.login_data = $scope.$storage.login_data;
	$scope.login_data.pass = '';

	$scope.login = function() {
		user = $scope.login_data.username;
		pass = $scope.login_data.pass;
		req = {
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
		var user = null;
		var pass = null;
		var req = null;
	};

})
 