'use strict';

/* global describe:false, it: false, SequentialEvent: false, expect: false, exports: false, global: false */

(() => {
	// ....
	if ( 'undefined' === typeof window && 'object' === typeof exports && typeof exports.nodeName !== 'string' ) {
		global.SequentialEvent = require( '../index' );
		global.expect = require( 'expect.js' );
	}
})();

if ( process.env.SAUCE === 'no' || typeof process.env.SAUCE === 'undefined') {
	describe( 'Event Emitter', ()=> {
		describe( 'Synchrone events', ()=> {
			it( 'Single event, single callback', () => {
				const called = {};
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', ()=> {
					called.test = true;
				});
				return mySequentialEvent1.emit( 'test' ).then(()=> {
					expect( called ).to.only.have.property( 'test', true );
				});
			});
			it( 'Single event, multiple callbacks', () => {
				const called = {};
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', data => {
					called.test_1 = data;
				});
				mySequentialEvent1.on( 'test', data => {
					called.test_2 = data;
				});

				const data = 'hello';
				return mySequentialEvent1.emit( 'test', data ).then(()=> {
					expect( called ).to.eql({
						test_1: data,
						test_2: data,
					});
				});
			});
			it( 'Multiple event, single callback', () => {
				const called = {};

				const mySequentialEvent1 = new SequentialEvent();
				mySequentialEvent1.on( 'test_1', data => {
					called.test_1 = data;
				});
				mySequentialEvent1.on( 'test_2', data => {
					called.test_2 = data;
				});

				const data = 'hello';
				return Promise.all([
					mySequentialEvent1.emit( 'test_1', data ),
					mySequentialEvent1.emit( 'test_2', data ),
				]).then(()=> {
					expect( called ).to.eql({
						test_1: data,
						test_2: data,
					});
				});
			});
		});
		describe( 'Asynchrone events', ()=> {
			it( 'Single event, single callback', () => {
				const called = {};
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', ()=> {
					return new Promise(( resolve, reject ) => {
						setTimeout(()=> {
							try {
								expect( called ).to.eql({});
							} catch ( e ) {
								return reject( e );
							}
							called.test = true;
							resolve();
						}, 100 );
					});
				});
				return mySequentialEvent1.emit( 'test' ).then(()=> {
					expect( called ).to.only.have.property( 'test', true );
				});
			});
			it( 'Single event, multiple callbacks', () => {
				const called = {};
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', data => {
					return new Promise(( resolve, reject ) => {
						setTimeout(()=> {
							try {
								expect( called ).to.eql({});
							} catch ( e ) {
								return reject( e );
							}
							called.test_1 = data;
							resolve();
						}, 200 );
					});
				});
				mySequentialEvent1.on( 'test', data => {
					return new Promise(( resolve, reject ) => {
						setTimeout(()=> {
							try {
								expect( called ).to.eql({
									test_1: data,
								});
							} catch ( e ) {
								return reject( e );
							}
							called.test_2 = data;
							resolve();
						}, 100 );
					});
				});

				const data = 'hello';
				return mySequentialEvent1.emit( 'test', data ).then(()=> {
					expect( called ).to.eql({
						test_1: data,
						test_2: data,
					});
				});
			});
		});
	});
	describe( 'Promises resolve/reject arguments', () => {
		describe( 'Only async handlers', () => {
			it( 'Single handler', () => {
				const mySequentialEvent1 = new SequentialEvent();
				const data = new Date().getTime();

				mySequentialEvent1.on( 'test', ( ...args )=> {
					return new Promise(( resolve, reject ) => {
						try {
							expect( args ).to.eql([ 'Hello', 42 ]);
							return setTimeout(() => {
								return resolve( data );
							}, 100 );
						} catch ( e ) {
							return reject( e );
						}
					});
				});
				return mySequentialEvent1.emit( 'test', 'Hello', 42 ).then( ret=> {
					expect( ret ).to.equal( data );
				});
			});
			it( 'Multiple handlers', () => {
				const mySequentialEvent1 = new SequentialEvent();
				const data = new Date().getTime();

				mySequentialEvent1.on( 'test', ( ...args ) => {
					return new Promise(( resolve, reject ) => {
						try {
							expect( args ).to.eql([ 'Hello', 42 ]);
							return setTimeout(() => {
								return resolve( data );
							}, 100 );
						} catch ( e ) {
							return reject( e );
						}
					});
				});
				return mySequentialEvent1.on( 'test', ( ...args ) => {
					return new Promise(( resolve, reject ) => {
						try {
							expect( args ).to.eql([ 'Hello', 42, data ]);
							return setTimeout(() => {
								return resolve( data );
							}, 100 );
						} catch ( e ) {
							return reject( e );
						}
					});
				});
				mySequentialEvent1.emit( 'test', 'Hello', 42 ).then( ret=> {
					expect( ret ).to.equal( data );
				});
			});
			it( 'Handler throws error', () => {
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', () => {
					return new Promise(( resolve, reject ) => {
						setTimeout(() => {
							return reject( new Error( 'Expected error' ));
						}, 100 );
					});
				});
				return mySequentialEvent1.emit( 'test' ).then(() => {
					return Promise.reject(new Error( 'Should throw an error' ));
				}).catch( err => {
					expect( err ).to.be.a( Error ) && expect( err.message ).to.equal( 'Expected error' );
				});
			});
		});
		describe( 'Only sync handlers', () => {
			it( 'Single handler', () => {
				const mySequentialEvent1 = new SequentialEvent();
				const data = new Date().getTime();

				mySequentialEvent1.on( 'test', ( ...args ) => {
					expect( args ).to.eql([ 'Hello', 42 ]);
					return data;
				});
				return mySequentialEvent1.emit( 'test', 'Hello', 42 ).then( ret => {
					expect( ret ).to.equal( data );
				});
			});
			it( 'Multiple handlers', () => {
				const mySequentialEvent1 = new SequentialEvent();
				const data = new Date().getTime();

				mySequentialEvent1.on( 'test', ( ...args ) => {
					expect( args ).to.eql([ 'Hello', 42 ]);
					return data;
				});
				mySequentialEvent1.on( 'test', ( ...args ) => {
					expect( args ).to.eql([ 'Hello', 42, data ]);
					return data;
				});
				return mySequentialEvent1.emit( 'test', 'Hello', 42 ).then( ret=> {
					expect( ret ).to.equal( data );
				});
			});
			it( 'Handler throws error', () => {
				const mySequentialEvent1 = new SequentialEvent();

				mySequentialEvent1.on( 'test', () => {
					throw new Error( 'Expected error' );
				});
				return mySequentialEvent1.emit( 'test' ).then(() => {
					return Promise.reject( new Error( 'Should throw an error' ));
				}).catch( err => {
					expect( err ).to.be.a( Error ) && expect( err.message ).to.equal( 'Expected error' );
					return Promise.resolve();
				});
			});
		});
		it( 'Mixed handlers', () => {
			const mySequentialEvent1 = new SequentialEvent();
			const data = new Date().getTime();

			mySequentialEvent1.on( 'test', ( ...args ) => {
				return new Promise(( resolve, reject ) => {
					try {
						expect( args ).to.eql([ 'Hello', 42 ]);
						return setTimeout(() => {
							return resolve( data );
						}, 100 );
					} catch ( e ) {
						return reject( e );
					}
				});
			});
			mySequentialEvent1.on( 'test', ( ...args ) => {
				expect( args ).to.eql([ 'Hello', 42, data ]);
				return data + 1;
			});
			mySequentialEvent1.on( 'test', ( ...args ) => {
				return new Promise(( resolve, reject ) => {
					try {
						expect( args ).to.eql([ 'Hello', 42, data + 1 ]);
						return setTimeout(() => {
							return resolve( args[2] + 1 );
						}, 100 );
					} catch ( e ) {
						return reject( e );
					}
				});
			});
			mySequentialEvent1.emit( 'test', 'Hello', 42 ).then( ret => {
				expect( ret ).to.equal( data + 2 );
			});
		});
	});
	it('Triggering unknown event', () => {
		const mySequentialEvent1 = new SequentialEvent();

		return mySequentialEvent1.emit( 'test' ).then(() => {
			return Promise.resolve();
		});
	});
}

if ( 'undefined' !== typeof process && process.env.SAUCE === 'yes' ) {
	require( './selenium.js' );
}