'use strict';

module.exports = function(app) {
	var programs = require('../controllers/programsController.js');

	app.route('/:table/programs')
		.get(programs.get_all_programs)
    .post(programs.create_program);

	app.route('/:table/programs/:id')
    .get(programs.get_program)
    .put(programs.update_program)
    .delete(programs.delete_program);

  var pkgs = require('../controllers/pkgsController.js');

	app.route('/:table/pkgs')
		.get(pkgs.get_all_pkgs)
    .post(pkgs.create_pkg);

	app.route('/:table/pkgs/:id')
    .get(pkgs.get_pkg)
    .put(pkgs.update_pkg)
    .delete(pkgs.delete_pkg);

  var rules = require('../controllers/rulesController.js');

	app.route('/:table/rules')
		.get(rules.get_all_rules)
    .post(rules.create_rule);

	app.route('/:table/rules/:id')
    .get(rules.get_rule)
    .put(rules.update_rule)
    .delete(rules.delete_rule);
};
