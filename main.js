
function Validator(options){
    var selectorRules = {}
    function getParent(element, selector){
        while (element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    function Validate(inputElement, rule, messageElement){
        // var messageError = rule.test(inputElement)
        var messageError;
        // console.log(messageError)
        // console.log(selectorRules[rule.selector])
        var rules = selectorRules[rule.selector]
        for (var i = 0; i < rules.length; i++){
            
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':{
                    messageError = rules[i]
                        (formElement.querySelector(rule.selector + ':checked'))
                    // console.log('message', messageError)
                    break
                }
                
                default:{
                    messageError = rules[i](inputElement.value)
                    // console.log('message1', messageError)
                }
            }
            if (messageError){
                // console.log(formElement.querySelector(rule.selector + ':checked'))
                break
            }
        }
        // console.log(messageError)   
        // console.log(messageElement)            

        if (messageError){
            messageElement.innerText = messageError
            getParent(inputElement, options.formGroup).classList.add('invalid')
        }else{
            messageElement.innerText = ''
            getParent(inputElement, options.formGroup).classList.remove('invalid')
        }  
        return !messageError; 
    }

    var formElement = document.querySelector(options.form)
    if (formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var messageElement = getParent(inputElement, options.formGroup).querySelector('.form-message')
                var isValid = Validate(inputElement, rule, messageElement)
                if (!isValid){
                    isFormValid = false;
                }
            })
            if (isFormValid){
                if (typeof options.onsubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    // console.log('enableInputs', enableInputs)
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':{
                                if (input.matches(':checked')){
                                    values[input.name] = input.value;
                                }
                                break
                            }
                            case 'checkbox':{
                                if (!input.matches(':checked')){
                                    return values
                                }
                                if (!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break
                            }
                            case 'file':{
                                values[input.name] = input.files;
                                break
                            }
                            default:{
                                values[input.name] = input.value;
                            }
                        }
                        
                        return values
                    },{})
                    options.onsubmit(formValues)
                }
            }

        }
        options.rules.forEach(function(rule){   
            // if (selectorRules[rule.selector] === undefined){
            //     selectorRules[rule.selector] = [rule.test]
            // }else{
            //     selectorRules[rule.selector].push(rule.test)
            // }
            
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement){
                var messageElement = getParent(inputElement, options.formGroup).querySelector('.form-message')
                inputElement.onblur = function(){
                    Validate(inputElement, rule, messageElement)
                }
    
                inputElement.oninput = function(){
                    messageElement.innerText = ''
                    getParent(inputElement, options.formGroup).classList.remove('invalid')
                }
            })
            
        })
        console.log(selectorRules)
    }
}

Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(data){
            // console.log(data.value)
            return data ? undefined : message
        }
    }
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(data){
            var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return regex.test(data) ? undefined : message
        }
    }
}

Validator.isLength = function(selector, min, message){
    return{
        selector: selector,
        test: function(data){
            return data.length >= min ? undefined : message;
        }
    }
}

Validator.passwordConfig = function(selector, isPassword, message){
    return{
        selector: selector,
        test: function(data){
            console.log(isPassword())
            return data === isPassword() ? undefined : message
        }
    }
}