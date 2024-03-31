/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
// import validator class
// import json web token library
const jwt = require('jsonwebtoken')
// import json web token secret
//const formidable = require('formidable')
//const fileConfig = require('../config/fileConfig')
const { secret } = require('../config')
// import response class
const response = require('../services/responseService')
// import permission class
//const permission = require('../services/accessMapper')
const userService = require('../src/user/user.service')
const config = require('../config/config')
// import formidable

// validate token
const getTokenFromHeader = (req) => {
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1]
    }
    return null
}


/**
 * Validate the query parameters in the API request
 * @param schema
 * @returns {Function}
 */
module.exports.validateQueryParameters = function (schema) {
    return (req, res, next) => {
        const result = schema.validate(req.query)
        if (result.error) {
            return response.customError(result.error.details[0].message, res)
        }

        next()
    }
}


/**
 * validate the API request body according to the schema defined
 * @returns validation Status
 * @param {*} schema
 */
module.exports.validateBody = (schema) => (req, res, next) => {
    try {
        const result = schema.validate(req.body)

        if (result.error) {
            return response.customError(
                result.error.details[0].message,
                res
            )
        }

    } catch (error) {
        return response.customError(
            `Internal Server Error ${error.message}`,
            res
        )
    }
    next()
}


/**
 * validate the API request header
 * @returns validation Status
 * @param grantedArray
 */
module.exports.validateHeader = (grantedArray) => (req, res, next) => jwt.verify(
    getTokenFromHeader(req), secret, async (err, decoded) => {
        if (err) {
            return response.customError('Invalid Token', res)
        }
        try {
            if (grantedArray) {
                await permission.validity(decoded.role, grantedArray)
            }
            res.locals.user = decoded
            next()
        } catch (error) {
            return response.customError(error.message, res)
        }
    }
)


/**
 * validate form data
 * @returns validation Status
 * @param {*} schema
 */
module.exports.validateMultipartFormData = (schema) => async (req, res, next) => {
    const form = formidable({
        uploadDir: fileConfig.imageSavePath,
        keepExtensions: true,
        maxFileSize: fileConfig.maxFileSize,
        multiples: true,
        filter: ({ mimetype }) => {
            if (req.fileisAllowed) {
                req.fileisAllowed.push(
                    config.allowedFileTypes.includes(mimetype)
                )
            } else {
                req.fileisAllowed = [
                    config.allowedFileTypes.includes(mimetype),
                ]
            }
            return true
        },
    })

    const formFields = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (
                req.fileisAllowed.find((bool) => bool === false) !==
                undefined
            ) {
                return response.customError(`Invalid file type found`, res)
            }
            if (err) {
                // reject(err);
                return response.customError(`${err}`, res)
            }

            resolve({ fields, files })
        })
    })

    const data = {
        ...formFields.fields,
        ...formFields.files,
    }

    for (const key in data) {
        if ({}.hasOwnProperty.call(data, key)) {
            try {
                // Convert strings to Json objects
                data[key] = JSON.parse(data[key])
            } catch (e) {
                // continue regardless of error
            }
        }
    }

    // Convert to array
    if (!Array.isArray(data.files)) {
        data.files = [data.files]
    }

    // Validate form fields
    const result = schema.validate(data)

    if (result.error) {
        return response.customError(result.error.details[0].message, res)
    }

    // Assign values to request body
    req.body = data
    next()
}


/**
 * Validate route parameters
 * @param schema
 * @returns {function(...[*]=)}
 */
module.exports.validateRouteParameters = function (schema) {
    // eslint-disable-next-line consistent-return
    return (req, res, next) => {
        const result = schema.validate(req.params)
        if (result.error) {
            return response.customError(result.error.details[0].message, res)
        }

        next()
    }
}


/**
 * Validate route parameters
 * @param schema
 * @returns {function(...[*]=)}
 */
module.exports.validateRouteAccessByRole = (allowedRoute) => async (req, res, next) => {
    const superAdminID = process.env.SUPER_ADMIN_ID
    if (res.locals.user.id === superAdminID) {
        next()
        return
    }

    const userWithRoutes = await userService.getUserByIDWithRole(res.locals.user.id)
    if (!userWithRoutes) {
        return response.customError(
            'Unexpected error occured, not authorized to use this route',
            res
        )
    }

    const { routes } = userWithRoutes.user_role
    if (!routes) {
        return response.customError(
            'Unexpected error occured, not authorized to use this route',
            res
        )
    }

    const baseRouteFind = routes.find(
        (route) => route.baseRoute === allowedRoute.baseRoute
    )
    if (baseRouteFind && baseRouteFind.is_allowed) {
        const submitBtnActionFind = baseRouteFind.submit_button_actions.find(
            (btn) => btn.name === allowedRoute.action
        )

        if (submitBtnActionFind && submitBtnActionFind.is_allowed) {
            next()
        } else {
            return response.customError(
                'You are not authorized to use this route',
                res
            )
        }

    } else {
        return response.customError(
            'You are not authorized to use this route',
            res
        )
    }
}


module.exports.validateRouteAccessByRoleMultiple = (allowedRoutes) => async (req, res, next) => {
    const superAdminID = process.env.SUPER_ADMIN_ID
    if (res.locals.user.id === superAdminID) {
        next()
        return
    }

    const userWithRoutes = await userService.getUserByIDWithRole(
        res.locals.user.id
    )
    if (!userWithRoutes) {
        return response.customError(
            'Unexpected error occured, not authorized to use this route',
            res
        )
    }

    const { routes } = userWithRoutes.user_role
    if (!routes) {
        return response.customError(
            'Unexpected error occured, not authorized to use this route',
            res
        )
    }

    let isAllowed = false
    for (let i = 0; i < allowedRoutes.length; i += 1) {
        const baseRouteFind = routes.find(
            (route) => route.baseRoute === allowedRoutes[i].baseRoute
        )
        if (baseRouteFind && baseRouteFind.is_allowed) {
            const btnFind = baseRouteFind.submit_button_actions.find(
                (btn) => btn.name === allowedRoutes[i].action
            )
            if (btnFind && btnFind.is_allowed) {
                isAllowed = true
            }
        }

        if (isAllowed) {
            break
        }

    }

    if (isAllowed) {
        next()
    } else {
        return response.customError(
            'Your user not authorized to use this route',
            res
        )
    }
    
}