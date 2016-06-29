angular.module('app.controllers', [])
  
.controller('miPerfilCtrl', function($rootScope, $scope, $http, $state, $localStorage, $timeout, $cordovaCamera, $window) {
	$rootScope.$on('$locationChangeSuccess', function(evt) {
		if ( !$localStorage.profile ) {
			$state.go('quiroDental', {}, {reload: true});
		}
		if (typeof $localStorage.profile !== 'undefined' && $localStorage.profile.birthday) {
			var today = new Date();
			var birthday = new Date($localStorage.profile.birthday.slice(0, 19));
			birthday.setDate(birthday.getDate()+1);
			if (today.getDate() == birthday.getDate() && today.getMonth() == birthday.getMonth()) {
				$scope.isBirthday = true;
			}
		}
	  });
	$scope.image = '';
	$scope.exit = function () {
		$localStorage.$reset();
		$state.go('quiroDental', {}, {reload: true});

	}
	$scope.call = function () {
		window.open('tel:59898172', '_system');
	}
	$scope.openfile = function () {

		var options = {
			quality: 50,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 100,
			targetHeight: 100,
			popoverOptions: CameraPopoverOptions,
		};

		$cordovaCamera.getPicture(options).then(function(imageURI) {
			var image = document.getElementById('myImage');
			image.src = "data:image/jpeg;base64,"+imageURI;
			$http({
			  method: 'POST',
			  url: 'http://dental.peralta.be/patients/setPhoto/'+$scope.profile.id,
			  data: {image: imageURI}
			}).then(function successCallback(response) {

			  }, function errorCallback(response) {
			    
			  });
		}, function(err) {
			// error
		});

	};
	$scope.onImageChange = function () {
		$scope.image = document.getElementById('file').files[0].name;
	}
	
	angular.element(document).ready(function () {
		$scope.profile = $localStorage.profile;
		if ( !$localStorage.profile ) {
			$state.go('quiroDental', {}, {reload: true});
		}
		if ($localStorage.profile.birthday) {
			var today = new Date();
			var birthday = new Date($localStorage.profile.birthday.slice(0, 19));
			birthday.setDate(birthday.getDate()+1);
			if (today.getDate() == birthday.getDate() && today.getMonth() == birthday.getMonth()) {
				$scope.isBirthday = true;
			}
		}
	});

})
   
.controller('cartTabDefaultPageCtrl', function($scope, $localStorage, $http, $cordovaCalendar, $ionicPopup) {
	$scope.goMap = function (lat, lon) {
			window.open("https://maps.google.com/?q=" + lat + "," + lon, '_system', 'location=yes');

		};	

	$scope.goCalendar = function (initDate, location) {
		$cordovaCalendar.createEvent({
            title: 'Consulta QuiroDental',
            location: location,
            notes: 'Recuerda llegar 15 minutos antes de tu cita;',
            startDate: initDate,
            endDate: moment(initDate).add(1,'hour').toDate()
        }).then(function (result) {
        	var alertPopup = $ionicPopup.alert({
		    	title: 'Evento agregado al calendario',
		     	template: 'Te esperamos ;)'
		    });
        	alertPopup.then(function (res) {})

        }, function (err) {
        	var alertPopup = $ionicPopup.alert({
		    	title: 'Error al agregar al calendario',
		     	template: 'Contáctanos'
		    });
        	alertPopup.then(function (res) {})
        });
	};

	$scope.confirmDate = function (id) {
		url = 'http://dental.peralta.be/appointments/confirmDate.json?id='+id;
		$http({method: 'GET', url:url}).then(
			function (result) {
				if(result.data.ok) {
					var alertPopup = $ionicPopup.alert({
			    		title: 'Cita confirmada',
			     		template: 'Te esperamos'
			    	});
	        		alertPopup.then(function (res) {})
				}
			}, 
			function (error) {
				alert("Error al confirmar, intente más tarde");
			});
	}; 

	$scope.historial = [];

	url = 'http://dental.peralta.be/appointments/getByUserID.json?userID='+$localStorage.login_data.id;
	$http({method:'GET', url:url}).then(function(result) {
		$scope.historial = _.filter(result.data.dentalDate, function(i) {

			var isFuture = new Date(i.appointment_date.slice(0,19)) > new Date();
			i.in_dateStr = moment(i.appointment_date).format('DD MMMM - HH:mm');
			i.in_date = new Date(i.appointment_date.slice(0,19));
			i.location = _.find($localStorage.units, function (j) {
				return j.id == i.unit_id;
			});
			return isFuture;
		});


	});
	//sendmail at confirm
	var url = '';
})
   
.controller('historialCtrl', function($scope, $localStorage, $http, $ionicPopup) {
	$scope.historial = [];
	$scope.rateDate = function (id, rate) {
		var url = 'http://dental.peralta.be/appointments/rateDate.json?id='+id+'&rate='+rate;
		$http({method:'GET',url:url}).then(
			function (result) {
				console.log(result);
				if (result.data.ok) {
					var alertPopup = $ionicPopup.alert({
				    	title: 'Gracias por tu opinión',
				     	template: 'Trabajamos para darte el mejor servicio.'
				    });
		        	alertPopup.then(function (res) {})
				}
			}
		);
	};

	url = 'http://dental.peralta.be/appointments/getByUserID.json?userID='+$localStorage.login_data.id;
	$http({method:'GET', url:url}).then(function(result) {
		$scope.historial = _.filter(result.data.dentalDate, function(i) {
			var isFuture = new Date(i.appointment_date.slice(0,19)) < new Date();
			i.appointment_date = moment(i.appointment_date).format('DD MMMM - HH:mm');
			i.doctor = _.find($localStorage.doctors, function(j) {return j.id == i.doctor_id});
			i.doctor_name = i.doctor.name + ' ' + i.doctor.lastname;
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
	var url_doctors = 'http://dental.peralta.be/doctors.json';
	var url_profiles = 'http://dental.peralta.be/patients.json';
	var url_units = 'http://dental.peralta.be/units.json';

	$http({method:'GET', url: url_units})
		.then(function(result) {
			$localStorage.units = result.data.units;
			return $http({method:'GET', url: url_doctors});
		})
		.then(function(result) {
			var doctors = result.data.doctors;
			$localStorage.doctors = doctors;
		});
	
	$scope.login_data = $scope.$storage.login_data;
	$scope.login_data.pass = '';

	
	$scope.login = function() {
		user = $scope.login_data.username;
		pass = $scope.login_data.pass;
		req = {
			method: 'GET',
			url: 'http://dental.peralta.be/patients/login.json?username='+user+'&pass='+pass
		}
		
		$http(req)
            .then(function(response) {
            	if (response.data.user.length > 0) {
            		$scope.login_data = response.data.user[0];
            		$scope.profile = response.data.user[0];
            		$localStorage.login_data = $scope.login_data;
            		$localStorage.profile = $scope.login_data;
            		$state.go('tabsController.miPerfil', {}, {reload: true});
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
 