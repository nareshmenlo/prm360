var app = angular.module('testApp',[]);

app.controller('testCtrl', ['$scope', function($scope){
    $scope.test = "Hello world!";
}]);