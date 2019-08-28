module.exports.person_date_model = `
birthday: {
  type: Sequelize[ dict['Date'] ]
}
`

module.exports.person_date_schema = `
"""
@original-field
"""
birthday: Date
`

module.exports.person_date_migration = `
birthday: {
    type: Sequelize[ dict['Date'] ]
}
`
