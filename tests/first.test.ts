import * as mocha from 'mocha';
import * as chai from 'chai';
import App from '../src/ElmProgram';

const expect = chai.expect;
describe('Platform.worker', () => {
  it('should decode list of dogs', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        'Spotty 12.9 UNKNOWN;Dashy 9.2 Female;Sparky 7.3 Male;',
      );
      done();
    });

    app.ports.decodeFromJs.send([
      {name: 'Spotty', weight: 12.9, sex: 'wrong-value'},
      {name: 'Dashy', weight: 9.2, sex: 'female'},
      {name: 'Sparky', weight: 7.3, sex: 'male'},
    ]);
  });

  it('should decode list of dogs with one dog', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal('Sparky 7.3 Male;');
      done();
    });

    app.ports.decodeFromJs.send([{name: 'Sparky', weight: 7.3, sex: 'male'}]);
  });

  it('should decode empty dog list', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal('');
      done();
    });

    app.ports.decodeFromJs.send([]);
  });

  it('should return an error when no list provided', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        `Problem with the given value:\n\nnull\n\nExpecting a LIST`,
      );
      done();
    });

    app.ports.decodeFromJs.send(null);
  });

  it('should return an error when not dogs object provided', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        `Problem with the value at json[0]:\n\n    {\n        "something": 10\n    }\n\nExpecting an OBJECT with a field named \`name\``,
      );
      done();
    });

    app.ports.decodeFromJs.send([{something: 10}]);
  });

  it('should return an error when name is integer', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        'Problem with the value at json[0].name:\n\n    10\n\nExpecting a STRING',
      );
      done();
    });

    app.ports.decodeFromJs.send([{name: 10}]);
  });

  it('should return an error when weight is array', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        'Problem with the value at json[0].weight:\n\n    []\n\nExpecting a FLOAT',
      );
      done();
    });

    app.ports.decodeFromJs.send([{name: 'Spoky', weight: []}]);
  });

  it('should return an error when sex is object', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        'Problem with the value at json[0].sex:\n\n    {}\n\nExpecting a STRING',
      );
      done();
    });

    app.ports.decodeFromJs.send([{name: 'Spoky', weight: 10.2, sex: {}}]);
  });

  it('works with empty values', done => {
    const app = App();

    app.ports.sentResultToJs.subscribe(function(result) {
      expect(result).to.equal(
        ' 0 UNKNOWN;',
      );
      done();
    });

    app.ports.decodeFromJs.send([
      {name: '', weight: 0, sex: ''},
    ]);
  });
});
