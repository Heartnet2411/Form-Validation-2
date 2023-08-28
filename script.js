function Validate(formSelector){
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var _this = this;
    var formElement = document.querySelector(formSelector);
    var formRules = {};
    var validatorRules = {
        required: function(value){
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function(value){
            var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        min: function(min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        }
        
    }

    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs){
            var ruleWithValue ;
            var ruleInfo;
            var rules = input.getAttribute('rules').split('|');

            for(var rule of rules){
                ruleWithValue = rule.includes(':');
                if (ruleWithValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if (ruleWithValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }   
            }
            
            //Lang nghe su kien onblur onchange
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event){
            var rules = formRules[event.target.name];

            var errorMessage;
            for(var rule of rules){
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }

            if(errorMessage){
                var formGroup = getParent(event.target, '.form-group');
                
                if(formGroup){
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage){
                        formGroup.classList.add('invalid');
                        formMessage.innerText = errorMessage;
                    }
                } else
                    return;
            }
            return !errorMessage;
        }

        function handleClearError(event){
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage){
                    formGroup.classList.add('invalid');
                    formMessage.innerText = "";
                }
            }
        }
    }
    //Xu ly hanh vi submit form
    formElement.onsubmit = function(event){
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;

        for(var input of inputs){
            if(!handleValidate({ target: input}))
                isValid = false
        }

        if (isValid){
            if(_this.onSubmit){
                var enableInputs = formElement.querySelectorAll('[name]')
                var formValue = Array.from(enableInputs).reduce(function (values, input) {
                    switch (input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                            break

                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                values[input.name] = ""
                                return values
                            }
                            if(!Array.isArray(values[input.name])){
                                values[input.name] = []
                            }
                            values[input.name].push(input.value)
                            break
  
                        case 'file':
                            values.input.name = input.files
                            break

                        default:
                            values[input.name] = input.value
                    }
                    return values 
                } , {})
                _this.onSubmit(formValue);
            } else {
                formElement.submit();
            }
        }
    }
}