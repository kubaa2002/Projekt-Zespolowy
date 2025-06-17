const checkIfUserOrCommunityRoute = (pathname) => {
    const userPattern = /^\/users\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i; // stackoverflow regex for UUID
    const communityPattern = /^\/communities\/\d+$/;  // assuming communityId is a number 
  
    return userPattern.test(pathname) || communityPattern.test(pathname);
};

export default checkIfUserOrCommunityRoute;