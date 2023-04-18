module.exports = function() {
    /**
     * Finds Pets by tags
     * @param {tags} Tags to filter by
     **/
    function findPetsByTags(tags) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/findByTags`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
            queryString: {
                "tags": `${tags}`
            },
        })
        return webRequest0;
    }

    /**
     * Creates list of users with given input array
     * @param {body} List of user object
     **/
    function createUsersWithArrayInput(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/createWithArray`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Add a new pet to the store
     * @param {body} Pet object that needs to be added to the store
     **/
    function addPet(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json,application/xml"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Update an existing pet
     * @param {body} Pet object that needs to be added to the store
     **/
    function updatePet(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet`,
            method: "PUT",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json,application/xml"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Finds Pets by status
     * @param {status} Status values that need to be considered for filter
     **/
    function findPetsByStatus(status) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/findByStatus`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
            queryString: {
                "status": `${status}`
            },
        })
        return webRequest0;
    }

    /**
     * Create user
     * @param {body} Created user object
     **/
    function createUser(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Returns pet inventories by status
     **/
    function getInventory() {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/store/inventory`,
            method: "GET",
            headers: {
                "accept": "application/json"
            },
        })
        return webRequest0;
    }

    /**
     * Get user by user name
     * @param {username} The name that needs to be fetched. Use user1 for testing.
     **/
    function getUserByName(username) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/${username}`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Delete user
     * @param {username} The name that needs to be deleted
     **/
    function deleteUser(username) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/${username}`,
            method: "DELETE",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Updated user
     * @param {username} name that need to be updated
     * @param {body} Updated user object
     **/
    function updateUser(username, body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/${username}`,
            method: "PUT",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Logs out current logged in user session
     **/
    function logoutUser() {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/logout`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Find purchase order by ID
     * @param {orderId} ID of pet that needs to be fetched
     **/
    function getOrderById(orderId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/store/order/${orderId}`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Delete purchase order by ID
     * @param {orderId} ID of the order that needs to be deleted
     **/
    function deleteOrder(orderId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/store/order/${orderId}`,
            method: "DELETE",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Place an order for a pet
     * @param {body} order placed for purchasing the pet
     **/
    function placeOrder(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/store/order`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Logs user into the system
     * @param {username} The user name for login
     * @param {password} The password for login in clear text
     **/
    function loginUser(username, password) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/login`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
            queryString: {
                "username": `${username}`,
                "password": `${password}`
            },
        })
        return webRequest0;
    }

    /**
     * uploads an image
     * @param {petId} ID of pet to update
     * @param {additionalMetadata} Additional data to pass to server
     * @param {file} file to upload
     **/
    function uploadFile(petId, additionalMetadata, file) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/${petId}/uploadImage`,
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "multipart/form-data"
            },
            body: {
                "additionalMetadata": "{additionalMetadata}",
                "file": "{file}"
            },
        })
        return webRequest0;
    }

    /**
     * Creates list of users with given input array
     * @param {body} List of user object
     **/
    function createUsersWithListInput(body) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/user/createWithList`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/json"
            },
            body: `${body}`,
        })
        return webRequest0;
    }

    /**
     * Find pet by ID
     * @param {petId} ID of pet to return
     **/
    function getPetById(petId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/${petId}`,
            method: "GET",
            headers: {
                "accept": "application/json,application/xml"
            },
        })
        return webRequest0;
    }

    /**
     * Updates a pet in the store with form data
     * @param {petId} ID of pet that needs to be updated
     * @param {name} Updated name of the pet
     * @param {status} Updated status of the pet
     **/
    function updatePetWithForm(petId, name, status) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/${petId}`,
            method: "POST",
            headers: {
                "accept": "application/json,application/xml",
                "content-type": "application/x-www-form-urlencoded"
            },
            body: {
                "name": "{name}",
                "status": "{status}"
            },
        })
        return webRequest0;
    }

    /**
     * Deletes a pet
     * @param {api_key} api_key
     * @param {petId} Pet id to delete
     **/
    function deletePet(api_key, petId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/pet/${petId}`,
            method: "DELETE",
            headers: {
                "accept": "application/json,application/xml",
                "api_key": `${api_key}`
            },
        })
        return webRequest0;
    }

    /**
     * getSchema
     **/
    function getSchema() {
        const constValue0 = `https`;
        return constValue0;
    }

    /**
     * getHost
     **/
    function getHost() {
        const constValue0 = `petstore.swagger.io`;
        return constValue0;
    }

    /**
     * getBasePath
     **/
    function getBasePath() {
        const constValue0 = `v2`;
        return constValue0;
    }

    return {
        findPetsByTags,
        createUsersWithArrayInput,
        addPet,
        updatePet,
        findPetsByStatus,
        createUser,
        getInventory,
        getUserByName,
        deleteUser,
        updateUser,
        logoutUser,
        getOrderById,
        deleteOrder,
        placeOrder,
        loginUser,
        uploadFile,
        createUsersWithListInput,
        getPetById,
        updatePetWithForm,
        deletePet,
        getSchema,
        getHost,
        getBasePath,
        $: {
            getSchema,
            getHost,
            getBasePath,
        },
    };
}