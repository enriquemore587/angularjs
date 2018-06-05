// controlador de checkInController
"use strict";
(function () {
    var app = angular.module('app');
    app.controller("SpecialEventsController", SpecialEventsController);

    SpecialEventsController.$inject = [
        "$rootScope",
        "$interval",
        "DataService",
        "DataServiceServer",
        "$sce",
        "$parse",
        '$location',
        '$routeParams',
        '$scope',
        '$timeout',
        '$filter'
    ];

    function SpecialEventsController(
        $rootScope,
        $interval,
        DataService,
        DataServiceServer,
        $sce,
        $parse,
        $location,
        $routeParams,
        $scope,
        $timeout,
        $filter
    ) {

        var vm = this;
        vm.esperar = false;
        vm.name = "Package WR";

        vm.usuarios = [];
        vm.rodadas = [];

        vm.items = [];


        vm.packWRObj = {};
        vm.obj = {};

        vm.newWeekObj = {};
        vm.fynallyOBJ = {};

        //  SWITCH PARA LISTADO DE DESHABILITADOS Y HABILITADOS
        vm.verTodosEventosSpeciales = false;

        /** 
         * 0 => new obj
         * 1 => edit obj
         * -1 => edit obj - child
        */
        vm.action;
        vm.ovjMasive = {};

        vm.ver_new_week = false;
        vm.newWeek = (value, regresar) => {
            vm.ver_new_week = value;
            vm.newWeekObj = {};

            vm.newWeekObj.type_code = 1;    // 1 es para porcentaje y el 2 es descuento en efectivo
            vm.newWeekObj.cantidad = 1000;
            //vm.newWeekObj.descuento = 100;
            vm.newWeekObj.percentage_des = 100;
            vm.newWeekObj.cost_des = 100;
            vm.fecha = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.newWeekObj.inicio_vigencia = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.newWeekObj.fin_vigencia = $filter('date')(new Date(), 'MM/dd/yyyy');
            vm.hora = '';
        }

        vm.saveNewRodada = () => {
            if (vm.action == 0) {
                console.log("accion", vm.action);
                // SOLO GUARDA EN MEMORIA POR QUE SE PERSISTE UN OBJETO COMPLETO
                vm.saveNewRodada_newSE();
            } else if (vm.action == -1) {
                console.log("accion", vm.action);
                vm.saveUpdateChild();
            } else if (vm.action == 1) {
                console.log("accion", vm.action);
                vm.newWeekObj.id_weekend_rides = 0;
                vm.newWeekObj.id_promo_code = 0;
                vm.saveUpdateChild();
            }
        }
        vm.saveUpdateChild = () => {

            swal({
                title: '¿ Estás seguro ?',
                text: `¡ Se guardaran los cambios cometidos !`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCloseButton: true,
                confirmButtonText: `Si, guardar`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {

                    console.log("11", new Date(vm.obj.start_date));
                    console.log("22", new Date(vm.fecha));
                    console.log("RR", new Date(vm.fecha) < new Date(vm.obj.start_date));
                    if (new Date(vm.fecha) < new Date(vm.obj.start_date)) {
                        Materialize.toast('La fecha de rodada fuera de rango !', 5000);
                        return;
                    }
                    console.log('vm.fynallyOBJ');

                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];


                    vm.fynallyOBJ.id_weekend_rides = vm.newWeekObj.id_weekend_rides
                    vm.fynallyOBJ.name = vm.newWeekObj.name;
                    vm.fynallyOBJ.place = vm.newWeekObj.place;
                    vm.fynallyOBJ.date = vm.fecha.split(/\//g)[2] + "-" + vm.fecha.split(/\//g)[0] + "-" + vm.fecha.split(/\//g)[1] + " " + vm.hora + ":00";
                    console.log('vm.fynallyOBJ.date', vm.fynallyOBJ.date);
                    vm.fynallyOBJ.description = vm.newWeekObj.description;
                    vm.fynallyOBJ.amount = 0;
                    vm.fynallyOBJ.terms = vm.newWeekObj.terms;
                    vm.fynallyOBJ.id_promo_code = vm.newWeekObj.id_promo_code;
                    vm.fynallyOBJ.code = vm.newWeekObj.code;
                    vm.fynallyOBJ.start_date = vm.newWeekObj.inicio_vigencia.split(/\//g)[2] + "-" + vm.newWeekObj.inicio_vigencia.split(/\//g)[0] + "-" + vm.newWeekObj.inicio_vigencia.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.newWeekObj.fin_vigencia.split(/\//g)[2] + "-" + vm.newWeekObj.fin_vigencia.split(/\//g)[0] + "-" + vm.newWeekObj.fin_vigencia.split(/\//g)[1];
                    vm.fynallyOBJ.code = vm.newWeekObj.code;
                    vm.fynallyOBJ.amount_use = vm.newWeekObj.cantidad;
                    vm.fynallyOBJ.type_code = vm.newWeekObj.type_code;
                    vm.fynallyOBJ.id_special_event = vm.obj.id_special_events;     //  el id lo obtengo del evento pather
                    vm.fynallyOBJ.percentage_des = vm.newWeekObj.percentage_des;
                    vm.fynallyOBJ.cost_des = vm.newWeekObj.cost_des;

                    console.log("sendv", vm.fynallyOBJ);




                    DataServiceServer.saveUpdateChild(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                $location.path("/login");
                                return;
                            }
                            vm.fynallyOBJ = {};
                            vm.ver_new_week = false;
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )
                            vm.update_list();
                        }, function errorCallback(response) {
                            console.log(response);
                            Materialize.toast('Service error', 5000);
                        });

                }
            })
        }


        vm.clearData = () => {
            $('#modal_new').modal('close');
            vm.obj = {};
            vm.verTodasRodadas = false;
            vm.rodadas = [];
            vm.fynallyOBJ = {};
        }

        vm.editChild = x => {
            vm.ver_new_week = true;
            vm.action = -1;
            vm.newWeekObj = x;
            vm.fecha = $filter('date')(vm.newWeekObj.date, 'MM/dd/yyyy');
            vm.hora = $filter('date')(vm.newWeekObj.date, 'HH:mm');
            vm.newWeekObj.inicio_vigencia = vm.newWeekObj.start_date.split("-")[1] + "/" + vm.newWeekObj.start_date.split("-")[2] + "/" + vm.newWeekObj.start_date.split("-")[0];
            vm.newWeekObj.fin_vigencia = vm.newWeekObj.end_date.split("-")[1] + "/" + vm.newWeekObj.end_date.split("-")[2] + "/" + vm.newWeekObj.end_date.split("-")[0];
            vm.newWeekObj.cantidad = vm.newWeekObj.amount_use;
            vm.newWeekObj.percentage_des = vm.newWeekObj.percentage_des;
            vm.newWeekObj.cost_des = vm.newWeekObj.cost_des;
            console.log(vm.newWeekObj);
        }

        vm.hora;
        vm.fecha;
        vm.saveNewRodada_newSE = () => {
            if (vm.action == 0) {
                //var dt = new Date(vm.fecha + " " + vm.hora + ":00").getTime();// - 25200000;
                vm.newWeekObj.date = vm.fecha.split(/\//g)[2] + "-" + vm.fecha.split(/\//g)[0] + "-" + vm.fecha.split(/\//g)[1] + " " + vm.hora + ":00";

                vm.newWeekObj.type_code = vm.newWeekObj.type_code;

                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                vm.newWeekObj.active = true;


                vm.rodadas.push(vm.newWeekObj);
                console.log("accion", vm.rodadas);
                vm.newWeekObj = {};
                vm.hora = '';
                vm.fecha = '';
                swal(
                    `Guardado !`,
                    `Se ha guardado los cambios`,
                    'success'
                )
                vm.newWeek(false);
            }
        }

        vm.new = (action) => {
            if (action == 0) vm.rodadas = [];
            vm.action = action;
            vm.obj.id_special_events = action;
            $('#modal_new').modal('open');
        }


        vm.update_list = () => {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                .then(function successCallback(response) {
                    console.log(response);
                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    //Materialize.toast('List updated', 4000);
                    vm.rodadas = response.special_events_details;
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }

        vm.saveUpdate = () => {
            if (vm.action == 0) {
                vm.saveUpdateNew();

            } else if (vm.action == 1) {
                vm.saveUpdateEdit();
            }
        }

        vm.close_modal = () => {
            vm.obj = {};
            vm.rodadas = [];
            $('#modal_new').modal('close');
        }

        vm.saveUpdateEdit = () => {
            swal({
                title: '¿ Estás seguro ?',
                text: `¡ Se guardaran los cambios cometidos !`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCloseButton: true,
                confirmButtonText: `Si, guardar`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];

                    vm.fynallyOBJ.name = vm.obj.name;
                    vm.fynallyOBJ.description = vm.obj.description;
                    vm.fynallyOBJ.terms = vm.obj.terms;
                    vm.fynallyOBJ.id_special_events = vm.obj.id_special_events;
                    vm.fynallyOBJ.start_date = vm.obj.start_date.split(/\//g)[2] + "-" + vm.obj.start_date.split(/\//g)[0] + "-" + vm.obj.start_date.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.obj.end_date.split(/\//g)[2] + "-" + vm.obj.end_date.split(/\//g)[0] + "-" + vm.obj.end_date.split(/\//g)[1];
                    console.log(vm.fynallyOBJ);

                    DataServiceServer.saveUpdateEdit(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                $location.path("/login");
                                return;
                            }
                            console.log(response);
                            vm.fynallyOBJ = {};
                            vm.obj = {};
                            getSpecialEvents();
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )
                            $('#modal_new').modal('close');
                        }, function errorCallback(response) {
                            Materialize.toast('ERROR POR CONEXION', 4000);
                        });

                }
            })
        }

        vm.saveUpdateNew = () => {
            swal({
                title: '¿ Estás seguro ?',
                text: `¡ Se guardaran los cambios cometidos !`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCloseButton: true,
                confirmButtonText: `Si, guardar`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    vm.fynallyOBJ.id_user = aux[0];
                    vm.fynallyOBJ.token = aux[1];
                    vm.fynallyOBJ.name = vm.obj.name;
                    vm.fynallyOBJ.description = vm.obj.description;
                    vm.fynallyOBJ.terms = vm.obj.terms;

                    vm.fynallyOBJ.start_date = vm.obj.start_date.split(/\//g)[2] + "-" + vm.obj.start_date.split(/\//g)[0] + "-" + vm.obj.start_date.split(/\//g)[1];
                    vm.fynallyOBJ.end_date = vm.obj.end_date.split(/\//g)[2] + "-" + vm.obj.end_date.split(/\//g)[0] + "-" + vm.obj.end_date.split(/\//g)[1];


                    vm.fynallyOBJ.weekend = [];
                    vm.rodadas.forEach(element => {
                        vm.fynallyOBJ.weekend.push(
                            [
                                element.name,
                                element.place,
                                element.date,
                                element.description,
                                0,/*costo*/
                                element.terms,
                                element.code,
                                element.inicio_vigencia.split(/\//g)[2] + "-" + element.inicio_vigencia.split(/\//g)[0] + "-" + element.inicio_vigencia.split(/\//g)[1],
                                element.fin_vigencia.split(/\//g)[2] + "-" + element.fin_vigencia.split(/\//g)[0] + "-" + element.fin_vigencia.split(/\//g)[1],
                                element.cantidad,   // falta las veces que se ocuparan
                                element.type_code,
                                element.cost_des,   // cantidad
                                element.percentage_des // porcentaje
                            ]
                        );

                    });
                    console.log(vm.fynallyOBJ);
                    DataServiceServer.setSpecialEventsAdminMassive(vm.fynallyOBJ)
                        .then(function successCallback(response) {
                            if (response == -3) {
                                Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                $location.path("/login");
                                return;
                            }

                            console.log(response);
                            //Materialize.toast('GUARDADO CON ÉXITO', 9000);
                            vm.fynallyOBJ = {};
                            getSpecialEvents();
                            swal(
                                `Guardado`,
                                `¡ Evento especial guardado !`,
                                'success'
                            )
                            $('#modal_new').modal('close');
                        }, function errorCallback(response) {
                            Materialize.toast('ERROR POR CONEXION', 4000);
                        });
                }
            })
        }


        vm.verTodasRodadas = false;
        vm.deleteWeekend = (week, hab, index) => {
            let msg = hab ? 'habilitará' : 'eliminará';
            let msg2 = hab ? 'habilitar' : 'eliminar';
            let msg3 = hab ? 'Habilitado' : 'Eliminado';
            swal({
                title: '¿ Estás seguro ?',
                text: `Se ${msg} ${week.name}`,
                type: 'warning',
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: `Si, ${msg2}!`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    console.log('vm.action__', vm.action);
                    if (vm.action == 0) {
                        vm.rodadas.splice(index, 1);
                    } else {
                        var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                        console.log('week', week);
                        console.log({
                            "id_user": aux[0],
                            "token": aux[1],
                            "id_weekend": week.id_weekend_rides,
                            "active": hab
                        });

                        DataServiceServer.desableWeek({
                            "id_user": aux[0],
                            "token": aux[1],
                            "id_weekend": week.id_weekend_rides,
                            "active": hab
                        }).then(function (response) {
                            swal(
                                `${msg3} !`,
                                `Se ha ${msg3}  ${week.name}`,
                                'success'
                            )
                            ///
                            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                                .then(function successCallback(response) {
                                    console.log("weeks", response);

                                    if (response == -3) {
                                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                                        $location.path("/login");
                                        return;
                                    }
                                    vm.rodadas = response.special_events_details;
                                    vm.esperar = false;
                                }, function errorCallback(response) {
                                    vm.esperar = false;
                                    Materialize.toast('ERROR POR CONEXION', 4000);
                                });
                            ///
                        });

                    }

                }
            })
        }

        vm.deleteSpecialEvent = (week, hab) => {

            let msg = hab ? 'habilitará' : 'eliminará';
            let msg2 = hab ? 'habilitar' : 'eliminar';
            let msg3 = hab ? 'Habilitado' : 'Eliminado';
            swal({
                title: '¿ Estás seguro ?',
                text: `Se ${msg} ${week.name}`,
                type: 'warning',
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: `Si, ${msg2}!`,
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                    console.log(week);

                    console.log({
                        "id_user": aux[0],
                        "token": aux[1],
                        "id_special_events": week.id_special_events,
                        "active": hab
                    });

                    DataServiceServer.desableSpecialEvents({
                        "id_user": aux[0],
                        "token": aux[1],
                        "id_special_events": week.id_special_events,
                        "active": hab
                    }).then(function (response) {
                        console.log(response);

                        swal(
                            `${msg3} !`,
                            `Se ha ${msg3}  ${week.name}`,
                            'success'
                        )
                        getSpecialEvents();
                    });

                }
            })
        }

        vm.editWP = seD => {
            vm.action = 1;
            vm.obj = seD;
            if (seD.start_date.includes("-")) {
                vm.obj.start_date = seD.start_date.split("-")[1] + "/" + seD.start_date.split("-")[2] + "/" + seD.start_date.split("-")[0];
                vm.obj.end_date = seD.end_date.split("-")[1] + "/" + seD.end_date.split("-")[2] + "/" + seD.end_date.split("-")[0];
            }
            vm.esperar = true;

            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            DataServiceServer.getSpecialEventsDetails(aux[0], aux[1], vm.obj.id_special_events)
                .then(function successCallback(response) {
                    console.log("weeks", response);

                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    vm.rodadas = response.special_events_details;
                    vm.esperar = false;
                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
            $('#modal_new').modal('open');
        }

        function initComponents() {
            $('.modal').modal({
                dismissible: false, // Modal can be dismissed by clicking outside of the modal
                opacity: .5, // Opacity of modal background
                inDuration: 300, // Transition in duration
                outDuration: 200, // Transition out duration
                startingTop: '4%', // Starting top style attribute
                endingTop: '10%', // Ending top style attribute
                ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                },
                complete: function () { } // Callback for Modal close
            });
            $('.datepicker').pickadate({
                selectMonths: true, // Creates a dropdown to control month
                selectYears: 70, // Creates a dropdown of 15 years to control year,
                today: 'Hoy',
                clear: 'Limpiar',
                close: 'Ok',
                format: 'mm/dd/yyyy',
                formatSubmit: 'mm/dd/yyyy',
                closeOnSelect: false // Close upon selecting a date,
            });
            $('.timepicker').pickatime({
                default: 'now', // Set default time: 'now', '1:30AM', '16:30'
                fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
                twelvehour: false, // Use AM/PM or 24-hour format
                donetext: 'OK', // text for done-button
                cleartext: 'Limpiar', // text for clear-button
                canceltext: 'Cancelar', // Text for cancel-button
                autoclose: false, // automatic close timepicker
                ampmclickable: true, // make AM PM clickable
                aftershow: function () { } //Function for after opening timepicker
            });
            getSpecialEvents();
        }

        function getSpecialEvents() {
            var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
            vm.esperar = true;
            DataServiceServer.getSpecialEvents(aux[0], aux[1])
                .then(function successCallback(response) {
                    if (response == -3) {
                        Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                        $location.path("/login");
                        return;
                    }
                    console.log(response.special_events);

                    vm.items = response.special_events;
                    vm.esperar = false;

                }, function errorCallback(response) {
                    vm.esperar = false;
                    Materialize.toast('ERROR POR CONEXION', 4000);
                });
        }



        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */

        vm.div_tracking = false;

        vm.repeat = 0;
        vm.confirmacion = false;
        vm.ride = {};
        vm.alertaParticipantes = [];
        vm.participantes = [];
        vm.NOk = false;
        vm.ride.emergency_number = '';
        vm.iterar = 0;
        vm.esperarTracking = false;
        vm.abierto = false;

        initComponents();

        vm.isOk = () => {
            var regex = new RegExp(/((^\d{10}$)|(^\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}[-|\s]?\d{2}$))/, 'g');
            if (regex.test(vm.ride.emergency_number)) {
                vm.NOk = true;
            } else {
                vm.NOk = false;
                return false;
            }
        }
        vm.verUser = item => {
            console.log(item);
            vm.mapWeek.setCenter({ lat: parseFloat(item.l.split(",")[0]), lng: parseFloat(item.l.split(",")[1]) });
            vm.mapWeek.setZoom(20);
        }

        vm.pregCerrarTrack = x => {
            swal({
                title: '¿ Estás seguro ?',
                text: `Parar tracking`,
                type: 'warning',
                confirmButtonColor: '#C0C0C0',
                cancelButtonColor: '#FF3800',
                cancelarButtonText: 'Cancelar',
                showCancelButton: true,
                showCloseButton: true,
                confirmButtonText: 'Si, parar!',
                focusConfirm: false
            }).then((result) => {
                if (result.value) {
                    vm.activeTracking();
                    vm.confirmacion = false;
                }
            })
        }
        function alertasF() {
            let flag = {};
            if (vm.alertaParticipantes.length > 0) {
                console.log(1);

                vm.alertaParticipantes.forEach(elem => {

                    if (elem.ec) {
                        console.log(2);
                        flag.ec = true;
                        $('#mec').css('visibility', 'visible');
                        console.log(3);
                        let sound = document.getElementById("sound");
                        console.log(4);
                        sound.pause();
                        console.log(5);
                        sound.currentTime = 0;
                        sound.play();
                        console.log(6);
                    } else {
                        console.log(7);
                        flag.ec = false;
                        $('#mec').css('visibility', 'hidden');
                        console.log(8);
                    }
                    if (elem.ed) {
                        console.log(9);
                        flag.ed = true;
                        $('#med').css('visibility', 'visible');
                        console.log(10);
                        let sound = document.getElementById("sound");
                        console.log(11);
                        sound.pause();
                        console.log(12);
                        sound.currentTime = 0;
                        sound.play();
                        console.log(13);
                    } else {
                        console.log(14);
                        flag.ed = false;
                        $('#med').css('visibility', 'hidden');
                        console.log(15);
                    }
                });
            } else {
                flag.ed = false;
                $('#mec').css('visibility', 'hidden');
                flag.ec = false;

                $('#med').css('visibility', 'hidden');
            }
        }

        vm.activeTracking = () => {
            vm.ride.active = !vm.ride.active;
            if (!vm.ride.emergency_number && vm.ride.active) {
                Materialize.toast('Falta número de emergencia', 3000);
                return;
            } else {
                var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                vm.ride.id_user = aux[0];
                vm.ride.token = aux[1];
                vm.esperarTracking = true;
                /**
                 *  
                     console.log('vm.ride', vm.ride);
                
                     active: true
​
                    emergency_number: "1234567899"
                    ​
                    id_user: "6ddc2c4b-093a-4120-91d2-f089be51690d"
                    ​
                    id_weekend: 28
                    ​
                    token: "44407ddb-144b-4e6a-a11a-7b185928b2cd"
                */
                DataServiceServer.activeTracking(vm.ride)
                    .then(function successCallback(response) {
                        if (response == -3) {
                            Materialize.toast('SE A INICIADO SESION EN OTRO DISPOSITIVO', 5000);
                            $location.path("/login");
                            return;
                        }

                        vm.update_list();
                        if (vm.ride.active) {
                            Materialize.toast('TRACKING INICIADO', 2000);
                            vm.esperarTracking = false;
                            loadData();
                        } else {
                            let id_weekend = vm.ride.id_weekend;
                            let nn = vm.ride.emergency_number;
                            vm.ride = {};
                            vm.ride.id_weekend = id_weekend;
                            vm.ride.emergency_number = nn;
                            vm.ride.active = false;
                            vm.participantes.forEach(elem => {
                                elem.tag.setMap(null);
                            });
                            vm.participantes = [];
                            vm.alertaParticipantes = [];
                            vm.iterar = 0;
                            vm.esperarTracking = false;

                            $('#mec').css('visibility', 'hidden');
                            $('#med').css('visibility', 'hidden');
                            Materialize.toast('TRACKING PARADO', 2000);
                        }
                    }, function errorCallback(response) {
                        Materialize.toast('ERROR POR CONEXION', 4000);
                    });
            }
        }

        vm.mapWeek = new google.maps.Map(document.getElementById('mapWeek'), {
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: { lat: 19.3906845, lng: -99.1624569 },
            zoom: 8
        });

        vm.camioneta = new google.maps.Marker({
            map: vm.mapWeek,
            title: 'CAMIONETA',
            icon: "menu\\camioneta.png"
        });


        function getMyPosition() {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        vm.camioneta.setPosition(pos);
                        console.log("posoicion camioneta", vm.camioneta.getPosition());
                    }, function (er) { //ERROR DE GEOLOCALIZACION
                        Materialize.toast(er.message, 2200);
                    });
                } else {
                    console.log("else => navigator.geolocation");
                }
            } catch (error) {
                console.log("No position");
            }
        }
        vm.centrar = x => {
            var limites = new google.maps.LatLngBounds();
            if (vm.participantes.length != 0) {
                for (let i = vm.participantes.length - 1; i >= 0; i--) {
                    limites.extend(vm.participantes[i].tag.position);
                }
            }
            try {
                limites.extend(vm.camioneta.position);
                vm.mapWeek.fitBounds(limites);
                console.log("center");

            } catch (error) {
                console.log("no hay ubicacion Camioneta");
            }
        }





        function loadData() {
            if (vm.abierto && vm.ride.active) {

                getMyPosition();
                vm.iterar++;

                console.log(vm.iterar % 10);

                let flag = {};

                vm.alertaParticipantes = [];
                vm.participantes.forEach(elem => {
                    try {
                        elem.tag.setMap(null);
                    } catch (e) {
                        console.log('limpieza de mapa');
                    }
                });
                vm.participantes = [];
                var aux = Base64.decode($rootScope.globals.currentUser.authdata).split(":");
                DataServiceServer.getTracking(aux[0], aux[1], vm.ride.id_weekend)
                    .then(function successCallback(response) {
                        if (vm.ride.active) {
                            try {
                                vm.participantes = response.tracking;
                            } catch (err) {
                                Materialize.toast('NO HAY DATOS DE CORREDORES', 5000);
                            }
                            var limites = new google.maps.LatLngBounds();
                            if (vm.participantes.length > 0) {
                                for (let i = vm.participantes.length - 1; i >= 0; i--) {
                                    try {
                                        if (vm.participantes[i].ec || vm.participantes[i].ed) {
                                            vm.alertaParticipantes.push(vm.participantes[i]);
                                        } // END IF
                                        vm.participantes[i].tag = new MarkerWithLabel({
                                            position: new google.maps.LatLng(vm.participantes[i].l.split(",")[0], vm.participantes[i].l.split(",")[1]),
                                            map: vm.mapWeek,
                                            labelContent: vm.participantes[i].un.split(" ")[0][0] + vm.participantes[i].un.split(" ")[1][0],
                                            icon: "components\\image\\iconoNegro.png",
                                            labelAnchor: new google.maps.Point(51, 4),
                                            labelClass: "labels",
                                            labelStyle: {
                                                opacity: 0.75
                                            }
                                        });

                                        if (!vm.participantes[i].ec && !vm.participantes[i].ed) {
                                            vm.participantes[i].tag.setIcon('components\\image\\iconoNegro.png');
                                        } else {
                                            vm.participantes[i].tag.setIcon('components\\image\\iconoRojo.png');
                                        }
                                    } catch (e) {
                                        console.log('Participante sin señal');
                                    }
                                } // END FOR
                            }
                            if (vm.iterar > 2 && vm.participantes.length == 0 && vm.esperarTracking == true) {
                                vm.esperarTracking = false;
                                Materialize.toast('NO SE ENCONTRARON CORREDORES. . . . .', 4000);
                            }
                            let tempPos = {};

                            vm.esperarTracking = false;
                            alertasF();
                            if (vm.iterar == 1) { vm.centrar(); console.log("PRIMER ITERACIÓN"); loadData(); }
                            else setTimeout(loadData, 10000);
                            return;

                        } // end if (vm.ride.active)

                    }, function errorCallback(response) {
                        Materialize.toast('Falla de conexión', vm.repeat * 1000);
                    });
            }
        } // end loadData



        vm.tracking = x => {
            vm.div_tracking = true;
            vm.nameTracking = x.name;
            vm.repeat = x.repeat_time;

            vm.ride.active = x.tracking;
            vm.ride.id_weekend = x.id_weekend_rides;
            console.log('vm.nameTracking => ', vm.nameTracking);
            console.log('vm.repeat => ', vm.repeat);
            console.log('vm.ride => ', vm.ride);

            //      arranca modal

            vm.isOk();
            vm.abierto = true;
            vm.esperarTracking = false;

            // modal tracking iniciada
            if (vm.ride.active) {
                vm.esperarTracking = true;
                loadData();
            } else {
                console.log("no esta activo");
                getMyPosition();
                vm.centrar();
            }

        }

        vm.close = () => {
            vm.div_tracking = false;
            vm.esperarTracking = false;
            vm.ride.active = false;
            vm.confirmacion = false;
            vm.ride = {};
            vm.abierto = false;
            vm.ride.active = false;
            vm.participantes.forEach(elem => {
                elem.tag.setMap(null);
            });
            vm.participantes = [];
            vm.alertaParticipantes = [];
            vm.iterar = 0;
            vm.repeat = 0;
        }

        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */
        /****************************************************************************************************************************************************************** */



    }
})();