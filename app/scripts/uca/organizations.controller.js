(function () {
'use strict';

angular.module('app.organizations')
.controller('organization-edit', ['$scope', '$window', '$location', '$state', '$stateParams', '$timeout', 'api_host', 'logger', 'Organization', function($scope, $window, $location, $state, $stateParams, $timeout, api_host, logger, Organization) {

    $scope.organization = {};

    if($stateParams.organizationId) {
        Organization.get({
            id: $stateParams.organizationId
        }, function(data) {
            $scope.organization = data;
            $scope.setup_component();
        });

    } else {
        $scope.organization = new Organization({
            what_for_title: 'Para qué?',
            how_title: 'Cómo?',
            why_title: 'Para qué?'
        });
        $timeout(function() {
            $scope.setup_component();
        }, 1000);

    }

    $scope.refresh = function() {
        Organization.get({
            id: $stateParams.organizationId
        }, function(data) {
            $scope.organization = data;
            $scope.setup_component();
        });
    };



    $scope.canSubmit = function() {
        return $scope.organization_form.$valid;
    };

    $scope.revert = function() {
        $scope.organization = new Organization({});
    };

    $scope.remove = function() {
        $scope.organization.$delete(function() {
            logger.logSuccess("Se eliminó la muestra"); 
            $state.go('organization-list'); 
        }).catch(function(response) {
            logger.logError(response.message); 
        });
    };



    $scope.submitForm = function() {
        if($scope.organization.id) {
            $scope.organization.$update(function() {
                logger.logSuccess("La muestra fue actualizado con éxito!"); 
                $state.go('organization-view', {
                    organizationId: $scope.organization.id
                }); 
            }).catch(function(response) {
                logger.logError(response.message); 
            });
        } else {
            $scope.organization.$save(function() {
                logger.logSuccess("La muestra fue creado con éxito!"); 
                $state.go('organization-view', {
                    organizationId: $scope.organization.id
                }); 
            }).catch(function(response) {
                logger.logError(response.message); 
            });
        }


    };
    $scope.setup_component = function () {
            jQuery('#organization_start_date').bootstrapMaterialDatePicker({  
                format : 'DD MM YYYY HH:mm',  
                minDate : new Date(), 
                currentDate: $scope.organization.start_event_date,
                lang: 'es'  
            }).on('change', function(e, date) { 
                $scope.organization.start_event_date = date;
            }); 

            jQuery('#organization_end_date').bootstrapMaterialDatePicker({  
                format : 'DD MM YYYY HH:mm',  
                minDate : new Date(), 
                currentDate: $scope.organization.finish_event_date,
                lang: 'es'  
            }).on('change', function(e, date) { 
                $scope.organization.finish_event_date = date;
            }); 


    };



    $scope.upload_url = api_host+"/api/media/upload";
    $scope.uploading = false;

    $scope.onUpload = function(response) {
        $scope.uploading = true;
    };

    $scope.onError = function(response) {
        $scope.uploading = false;
        console.log('error');
    };

    $scope.onComplete = function(response) {
        $scope.uploading = false;
        $scope.organization.main_picture = response.data.filename;
        $scope.organization.media_id = response.data.media_id;
    };



}])
.controller('organizations-list', ['$scope', '$http', '$state', 'api_host', 'Organization', 'logger', function($scope, $http, $state, api_host, Organization, logger) {
   
    Organization.query(function(data) {
        $scope.organizations = data;
    });

    $scope.view = function(id) {
        console.log('view '+id);
        $state.go('organization-view', {
            organizationId: id
        }); 
    };

    $scope.edit = function(id) {
        $state.go('organization-edit', {
            organizationId: id
        }); 
    };

    $scope.remark = function(id) {
        $http.post(api_host+'/api/organization/'+id+'/remark', {

        }).success(function(data) {
            logger.logSuccess("Se marcó como importante la muestra"); 
            Organization.query(function(data) {
                $scope.organizations = data;
            });

        });
    };

    $scope.unremark = function(id) {
        $http.post(api_host+'/api/organization/'+id+'/unremark', {

        }).success(function(data) {
            logger.logSuccess("Se desmarcó como importante la muestra"); 
            Organization.query(function(data) {
                $scope.organizations = data;
            });
        });
    };




}])
.controller('organization-view', ['$scope', '$window', 'Organization', '$location', '$state', '$stateParams', 'api_host', function($scope, $window, Organization, $location, $state, $stateParams, api_host) {
    $scope.organization = {};

    $scope.show_activities = false;
    $scope.show_medias = true;
    $scope.show_geopoints = false;

    Organization.get({
        id: $stateParams.organizationId
    }, function(data) {
        $scope.organization = data;
        $scope.activities = $scope.organization.activities;
        $scope.medias = $scope.organization.medias;
        $scope.upload_url = api_host+'/api/media/organization/'+$scope.organization.id+'/upload';
    });

    $scope.showActivities = function() {
        $scope.show_activities = true;
        $scope.show_products = false;
        $scope.show_medias = false;
        $scope.show_geopoints = false;
    };

    $scope.showMedias = function() {
        $scope.show_activities = false;
        $scope.show_medias = true;
    };

    $scope.edit = function(id) {
        $state.go('organization-edit', {
            organizationId: id
        }); 
    };


}])
.controller('organization-activities', ['$scope', '$state', function($scope, $state) {

    $scope.activities_dates = [];

    $scope.viewActivity = function(id) {
        console.log('view '+id);
        $state.go('activity-view', {
            activityId: id
        }); 
    };

    $scope.addActivity = function() {
        console.log('Add Activity: '+$scope.organization.id);
        $state.go('activity-new', {
            type: 'organization',
            id: $scope.organization.id
        });
    };

    $scope.process_dates = function() {
        $scope.activities_dates = _.groupBy($scope.activities, function(item) {
            return moment(item.event_date).startOf('day');
        });
        console.dir($scope.activities_dates);
    };

    $scope.process_dates();

    console.log('activities');
}])
.controller('organization-medias', ['$scope', '$http', '$state', 'api_host', 'logger', 'Organization', function($scope, $http, $state, api_host, logger, Organization) {
    
    $scope.media = {};
    $scope.adding_media = false;
    $scope.uploading = false;

    $scope.addMedia = function() {
        $scope.adding_media = true;
    };

    $scope.selectAsMainPicture = function(media) {
        $http.post(api_host+'/api/organization/'+$scope.organization.id+'/mainPicture/'+media.id, {

        }).success(function(data) {
            $scope.organization.main_picture = data.name;
            logger.logSuccess("Se estableció imagen como principal"); 
        });
    };

    $scope.cancelUpload = function() {
        $scope.media = {};
        $scope.adding_media = false;
    };

    $scope.onUpload = function(response) {
        $scope.uploading = true;
    };

    $scope.onError = function(response) {
        logger.logError('Surgió un error al subir imagen.'); 
        $scope.uploading = false;
    };

    $scope.onComplete = function(response) {
        logger.logSuccess("Se agregó imagen con éxito!"); 
        $scope.uploading = false;
        $scope.adding_media = false;
        $scope.fetchMedias();
    };

    $scope.fetchMedias = function() {
        $http.get(api_host+'/api/organization/'+$scope.organization.id+'/medias') 
        .success(function(data) {
            $scope.medias = data;
        });

    };


}]);


})(); 




