var userModule = angular.module("prm.user", [
    'ui.router',
    'ui.bootstrap',
	'angular-storage','ngSanitize'
]).controller('userController', userController);

function userController($scope, userService, $uibModal){
	$scope.currentPage = 1;
	$scope.totalItems = 0;
	$scope.userList = [];
	$scope.noUsers = false;
	$scope.searchText = '';
	$scope.getData = function(){
		userService.getUserList($scope.currentPage,$scope.searchText).then(function(response){
			if(response && response.data && !response.data.error){
				var data = response.data.data;
				$scope.totalItems = data.total;
				$scope.userList = data.data;
				$scope.noUsers = false;	
				if(!$scope.totalItems){
					$scope.noUsers = true;	
				}	
			}else if(response && response.data && !response.data.error){
				$scope.noUsers = true;	
			}
		});
	}
	
	$scope.getData();
	
	$scope.pageChanged = function() {
		$scope.getData();
	};
	
	$scope.search = function() {
		$scope.currentPage = 1;
		$scope.getData();
	};
	
	$scope.confirmDelete = function(userId, index) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'deleteModalContent.html',
			controller: 'userDeleteModalInstanceCtrl',
			resolve: {
				info: {
					'userId':userId,
					'index': index
				}
			}
		});
		
		modalInstance.result.then(function (info) {
			$scope.userList.splice( info.index, 1);
		}, function () {
			//console.log('Modal dismissed at: ' + new Date());
		});
	};
}

userModule.controller('userDeleteModalInstanceCtrl', function($scope, $uibModalInstance, userService, info){
	$scope.info = info;
	$scope.deleteFailed = false;
	$scope.deleteLoading = false;
	$scope.yes = function () {
		$scope.deleteLoading = true;	
		userService.deleteUser(info.userId).then(function(response){
			if(response && response.data && !response.data.error){
				$uibModalInstance.close($scope.info);		
			}else{
				$scope.deleteFailed = true;	
			}
			$scope.deleteLoading = false;
		});
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
});