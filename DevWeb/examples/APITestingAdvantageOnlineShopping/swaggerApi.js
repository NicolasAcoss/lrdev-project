module.exports = function() {
    /**
     * Clear user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {orderId} orderId
     * @param {userId} userId
     **/
    function removeOrderUsingDELETE(Authorization, orderId, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/history/users/${userId}/${orderId}`,
            method: "DELETE",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Purchase new order
     * @param {Authorization} JSON Web Token
     * @param {purchaseRequest} purchaseRequest
     * @param {userId} userId
     **/
    function doPurchaseUsingPOST(Authorization, purchaseRequest, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/users/${userId}`,
            method: "POST",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
            body: purchaseRequest,
        })
        return webRequest0;
    }

    /**
     * Restore Database factory settings
     **/
    function dbRestoreFactorySettingsUsingGET() {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/order/Restore_db_factory_settings`,
            method: "GET",
            headers: {
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Get order fields
     **/
    function orderFieldsUsingGET() {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/fields`,
            method: "GET",
            headers: {
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Clear user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {userId} userId
     **/
    function removeAllOrdersForUserUsingGET(Authorization, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/history/users/${userId}`,
            method: "GET",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Order shipping cost
     * @param {costRequest} costRequest
     **/
    function getShippingCostFromShipExUsingPOST(costRequest) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/shippingcost`,
            method: "POST",
            headers: {
                "accept": "*/*",
                "content-type": "application/json"
            },
            body: costRequest,
        })
        return webRequest0;
    }

    /**
     * Add product to shopping cart
     * @param {Authorization} JSON Web Token
     * @param {color} color
     * @param {hasWarranty} hasWarranty
     * @param {productId} productId
     * @param {quantity} quantity
     * @param {userId} userId
     **/
    function addProductToCartUsingPOST(Authorization, color, hasWarranty, productId, quantity, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}/product/${productId}/color/${color}`,
            method: "POST",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
            queryString: {
                "hasWarranty": hasWarranty,
                "quantity": quantity
            },
        })
        return webRequest0;
    }

    /**
     * Remove a product from user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {color} color
     * @param {productId} productId
     * @param {userId} userId
     **/
    function removeProductFromUserCartUsingDELETE(Authorization, color, productId, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}/product/${productId}/color/${color}`,
            method: "DELETE",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Update Cart-Product quantity and/or color
     * @param {Authorization} JSON Web Token
     * @param {color} color
     * @param {new_color} new_color
     * @param {productId} productId
     * @param {quantity} quantity
     * @param {userId} userId
     **/
    function updateProductInCartUsingPUT(Authorization, color, new_color, productId, quantity, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}/product/${productId}/color/${color}`,
            method: "PUT",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
            queryString: {
                "new_color": new_color,
                "quantity": quantity
            },
        })
        return webRequest0;
    }

    /**
     * Get application status
     **/
    function getHealthCheckUsingGET() {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/healthcheck`,
            method: "GET",
            headers: {
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Get user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {userId} userId
     **/
    function getUserCartUsingGET(Authorization, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}`,
            method: "GET",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Clear user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {userId} userId
     **/
    function clearUserCartUsingDELETE(Authorization, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}`,
            method: "DELETE",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Replace user shopping cart
     * @param {Authorization} JSON Web Token
     * @param {shoopingCartProducts} shoopingCartProducts
     * @param {userId} userId
     **/
    function replaceUserCartUsingPUT(Authorization, shoopingCartProducts, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}`,
            method: "PUT",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
            body: shoopingCartProducts,
        })
        return webRequest0;
    }

    /**
     * Verify and update products quantities in user cart
     * @param {Authorization} JSON Web Token
     * @param {shoopingCartProducts} shoopingCartProducts
     * @param {userId} userId
     **/
    function verifyProductsQuantitiesInUserCartUsingPUT(Authorization, shoopingCartProducts, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}/quantity`,
            method: "PUT",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
            body: shoopingCartProducts,
        })
        return webRequest0;
    }

    /**
     * Get orders history of orders-lines for userID
     * @param {userId} userId
     **/
    function getHistoryOrdersLinesUsingGET(userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/history/lines/users/${userId}`,
            method: "GET",
            headers: {
                "accept": "*/*"
            },
        })
        return webRequest0;
    }

    /**
     * Add old order to shopping cart
     * @param {Authorization} JSON Web Token
     * @param {orderId} orderId
     * @param {userId} userId
     **/
    function addOldOrderToCartUsingPOST(Authorization, orderId, userId) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/carts/${userId}/orders/${orderId}`,
            method: "POST",
            headers: {
                "Authorization": `${Authorization}`,
                "accept": "*/*",
                "content-type": "application/json"
            },
        })
        return webRequest0;
    }

    /**
     * Get orders history by user-id and/or order-id
     * @param {order_id} order_id
     * @param {user_id} user_id
     **/
    function getOrdersHistoryUsingGET(order_id, user_id) {
        const webRequest0 = new load.WebRequest({
            url: `${this.$.getSchema()}://${this.$.getHost()}/${this.$.getBasePath()}/api/v1/orders/history`,
            method: "GET",
            headers: {
                "accept": "*/*"
            },
            queryString: {
                "order_id": order_id,
                "user_id": user_id
            },
        })
        return webRequest0;
    }

    /**
     * getSchema
     **/
    function getSchema() {
        const constValue0 = `http`;
        return constValue0;
    }

    /**
     * getHost
     **/
    function getHost() {
        const constValue0 = `www.advantageonlineshopping.com`;
        return constValue0;
    }

    /**
     * getBasePath
     **/
    function getBasePath() {
        const constValue0 = `order`;
        return constValue0;
    }

    return {
        removeOrderUsingDELETE,
        doPurchaseUsingPOST,
        dbRestoreFactorySettingsUsingGET,
        orderFieldsUsingGET,
        removeAllOrdersForUserUsingGET,
        getShippingCostFromShipExUsingPOST,
        addProductToCartUsingPOST,
        removeProductFromUserCartUsingDELETE,
        updateProductInCartUsingPUT,
        getHealthCheckUsingGET,
        getUserCartUsingGET,
        clearUserCartUsingDELETE,
        replaceUserCartUsingPUT,
        verifyProductsQuantitiesInUserCartUsingPUT,
        getHistoryOrdersLinesUsingGET,
        addOldOrderToCartUsingPOST,
        getOrdersHistoryUsingGET,
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