const config = {}

config.web_port = process.env.HTTP_PORT
config.https_web_port = process.env.HTTPS_PORT

// DB
config.database = process.env.DATABASE_URL
config.testDatabase = process.env.TEST_DATABASE_URL

config.app_name = process.env.APP_NAME
config.server_path = process.env.SERVER_PATH
config.sslPrivetKeyPath = process.env.PRIVATE_KEY_PATH
config.sslCertKeyPath = process.env.CERT_KEY_PATH
config.sslCertAuthPath = process.env.CERT_AUTH_PATH
config.isProduction = JSON.parse(process.env.IS_PRODUCTION)
config.allowedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/json',
]
config.pdfMimeType = 'application/pdf'
config.wordMimeType =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
config.svgMimeType = 'image/svg+xml'
config.jsonMimeType = 'application/json'

config.role_types = { student: 'student', teacher: "teacher", admin: 'admin' }

module.exports = config