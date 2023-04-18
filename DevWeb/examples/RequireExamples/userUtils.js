module.exports = {
    //This will be exported from the file
	loginUser(username) {
		load.log(`The user ${username} logged in`);
	},

	logoutUser(username) {
		load.log(`Bye bye ${username}`);
	}
};