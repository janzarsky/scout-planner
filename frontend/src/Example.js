import Data from './Data';
import DateUtils from './DateUtils';

async function clear() {
  return Promise.all([
    Data.getPrograms(),
    Data.getPkgs(),
    Data.getRules(),
  ]).then(([programs, pkgs, rules]) =>
    Promise.all([
      ...[...programs.values()].map(it => Data.deleteProgram(it._id)),
      ...[...pkgs.values()].map(it => Data.deletePkg(it._id)),
      ...[...rules.values()].map(it => Data.deleteRule(it._id)),
    ])
  );
}

async function load() {
  const pkgs = [
    { name: 'Bezpečnost', color: '#ffe082' },
    { name: 'Hospodaření', color: '#9fa8da' },
    { name: 'Komunikace', color: '#ffe082' },
    { name: 'Metodika', color: '#80cbc4' },
    { name: 'Myšlenkové základy a historie', color: '#ce93d8' },
    { name: 'Organizace', color: '#e6ee9c' },
    { name: 'Osobnost', color: '#ffab91' },
    { name: 'Právo', color: '#e6ee9c' },
    { name: 'Psychologie', color: '#80deea' },
    { name: 'Zdravověda', color: '#b0bec5' },
    { name: 'Real', color: '#f48fb1' },
    { name: 'Téma', color: '#a5d6a7' },
    { name: 'AV', color: '#ffffff' },
    { name: 'Ostatní', color: '#b0bec5' },
    { name: 'Technické', color: '#eceff1' },
  ];

  const programs = [
    { title: 'Úvod', begin: '16:00 12.6.2020', duration: '1:00', pkg: 'Ostatní', people: [] },
    { title: 'Prohlídka hradiště', begin: '17:00 12.6.2020', duration: '1:00', pkg: 'Ostatní', people: [] },
    { title: 'Večeře', begin: '18:00 12.6.2020', duration: '1:00', pkg: 'Technické', people: [] },
    { title: 'Taková normální rodinka', begin: '19:00 12.6.2020', duration: '3:00', pkg: '', people: [] },
    { title: 'Snídaně', begin: '7:00 13.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Plánování', begin: '8:30 13.6.2020', duration: '2:00', pkg: 'Metodika', people: [] },
    { title: 'Sv.', begin: '10:30 13.6.2020', duration: '0:30', pkg: 'Technické', people: [] },
    { title: 'Organizace', begin: '11:00 13.6.2020', duration: '1:30', pkg: 'Organizace', people: [] },
    { title: 'Oběd', begin: '12:30 13.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Skautská historie a současnost', begin: '14:00 13.6.2020', duration: '2:30', pkg: 'Myšlenkové základý a historie', people: [] },
    { title: 'Sv.', begin: '16:30 13.6.2020', duration: '0:30', pkg: 'Technické', people: [] },
    { title: 'Konzultace projektů', begin: '17:00 13.6.2020', duration: '1:00', pkg: 'Ostatní', people: [] },
    { title: 'Večeře', begin: '18:00 13.6.2020', duration: '1:00', pkg: 'Technické', people: [] },
    { title: 'Diskuzní kavárna', begin: '19:00 13.6.2020', duration: '3:00', pkg: 'Ostatní', people: [] },
    { title: 'Snídaně', begin: '7:00 14.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Právo', begin: '8:30 14.6.2020', duration: '1:30', pkg: 'Právo', people: [] },
    { title: 'Sv.', begin: '10:00 14.6.2020', duration: '0:30', pkg: 'Technické', people: [] },
    { title: 'Pedagogika', begin: '10:30 14.6.2020', duration: '1:00', pkg: 'Psychologie', people: [] },
    { title: 'Bezpečnost', begin: '11:30 14.6.2020', duration: '1:00', pkg: 'Bezpečnost', people: [] },
    { title: 'Oběd', begin: '12:30 14.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Hospodaření 1', begin: '14:00 14.6.2020', duration: '1:30', pkg: 'Hospodaření', people: [] },
    { title: 'Sv.', begin: '15:30 14.6.2020', duration: '0:30', pkg: 'Technické', people: [] },
    { title: 'Nástroje + skauting', begin: '16:00 14.6.2020', duration: '2:30', pkg: 'Metodika', people: [] },
    { title: 'Večeře', begin: '18:30 14.6.2020', duration: '1:00', pkg: 'Technické', people: [] },
    { title: 'Hledání skautské myšlenky', begin: '19:30 14.6.2020', duration: '2:30', pkg: 'Myšlenkové základy a historie', people: [] },
    { title: 'Snídaně', begin: '7:00 15.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Psycho bezpečnost', begin: '8:30 15.6.2020', duration: '1:30', pkg: 'Psychologie', people: [] },
    { title: 'Sv.', begin: '10:00 15.6.2020', duration: '0:30', pkg: 'Technické', people: [] },
    { title: 'Ekoblok', begin: '10:30 15.6.2020', duration: '2:00', pkg: 'Téma', people: [] },
    { title: 'Oběd', begin: '12:30 15.6.2020', duration: '1:30', pkg: 'Technické', people: [] },
    { title: 'Závěr', begin: '14:00 15.6.2020', duration: '1:30', pkg: 'Ostatní', people: [] },
  ];

  const rules = [
    { program: 'Plánování', condition: 'is_before_program', value: 'Nástroje + skauting' },
    { program: 'Právo', condition: 'is_after_program', value: 'Organizace' },
    { program: 'Organizace', condition: 'is_after_date', value: '14:00 13.6.2020' },
    { program: 'Úvod', condition: 'is_before_date', value: '20:00 12.6.2020' },
    { program: 'Závěr', condition: 'is_after_date', value: '8:00 15.6.2020' },
    { program: 'Závěr', condition: 'is_before_date', value: '15:00 15.6.2020' },
    { program: 'Pedagogika', condition: 'is_after_program', value: 'Psycho bezpečnost' },
  ];

  return Promise.all([
    ...pkgs.map(pkg => Data.addPkg(pkg))
  ])
  .then(pkgs => new Map(pkgs.map(pkg => [pkg.name, pkg._id])))
  .then(pkgs =>
    programs.map(prog => {
      return {
        ...prog,
        begin: DateUtils.parseDateTime(prog.begin),
        duration: DateUtils.parseDuration(prog.duration),
        pkg: (prog.pkg && pkgs.get(prog.pkg)) ? pkgs.get(prog.pkg) : '',
      }
    })
  )
  .then(programs => Promise.all(programs.map(prog => Data.addProgram(prog))))
  .then(programs => new Map(programs.map(prog => [prog.title, prog._id])))
  .then(programs =>
    rules.map(rule => {
      var value;
      if (rule.condition === 'is_before_date' || rule.condition === 'is_after_date')
        value = DateUtils.parseDateTime(rule.value);
      else if (rule.condition === 'is_before_program' || rule.condition === 'is_after_program')
        value = programs.get(rule.value);
      return {
        ...rule,
        program: programs.get(rule.program),
        value: value,
      };
    })
  )
  .then(rules => Promise.all(rules.map(rule => Data.addRule(rule))));
}

export default {clear, load};
