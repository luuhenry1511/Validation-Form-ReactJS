import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

function Validator(options){

    function getParent (element, selector) {
        while (element.parentElement){
            if (element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules={};

    function validate(inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
    
        return !errorMessage; 
    }
    var formElement = document.querySelector(options.form);
    
    if (formElement){
        //Khi submit form
        formElement.onsubmit = function(e){
            //ngăn sự kiện submit
            e.preventDefault();

            var isFormValid = true;
            // lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isValid =validate(inputElement, rule);
                if (!isValid){
                    isFormValid =false;
                }
            });


            if (isFormValid){
                //trương hơp submit với js
                if (typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues=Array.from(enableInputs).reduce(function(values, input){
                    
                    switch(input.type){
                        case 'radio':
                        
                            values[input.name]= formElement.querySelector('input[name="'+ input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if (!input.matches(':checked')){
                                values[input.name]='';
                                return values;
                            }
                            if (Array.isArray(values[input.name])){
                                values[input.name] = []
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                        default:
                            values[input.name]= input.value;
                    }
                    
                    return  values;
            },{});
                options.onSubmit(formValues);
                } 
                //trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            } 
        }
        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
        options.rules.forEach(function (rule){

            //Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement) {
                //xử lý trường hợp blur khỏi input
                inputElement.onblur= function(){
                    validate(inputElement, rule);
                }
                //xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput= function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
            
        });
       
    }
    
}
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
           return( value ? undefined :  message ||'Vui lòng nhập vào trường này');
        }
    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            var regex=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value) ? undefined :  message || "Trường này phải là email";
        }
    };
}
Validator.minLength = function(selector, min,  message){
    return {
        selector: selector,
        test: function(value){
            return value.length>=min?  message || undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value){
                return value=== getConfirmValue()? undefined: message || 'Giá trị nhập vào không chính xác';
        }
    };
}
//  document.addEventListener('DOMContentLoaded', function () {
//         // Mong muốn của chúng ta
//         Validator({
//           form: '#form-1',
//           errorSelector: '.form-message',
//           formGroupSelector: '.form-group',
//           rules: [
//             Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ của bạn'),
//             Validator.isRequired('#email'),
//             Validator.isEmail('#email'),
//             Validator.isRequired("#password"),
//             Validator.minLength('#password',6),
//             Validator.isRequired('#password_confirmation', 'Vui lòng nhập mật khẩu'),
//             Validator.isConfirmed("#password_confirmation", function(){
//                 return document.querySelector("#form-1 #password").value;
//             }, 'Mật khẩu nhập lại không chính xác'),
//             Validator.isRequired('input[name="gender"]'),
//           ],
//           onSubmit: function(data) {
//               //call API
//               console.log(data);
//           }
          
//         });
  
  
//         Validator({
//           form: '#form-2',
//           formGroupSelector: '.form-group',
//           errorSelector: '.form-message',
//           rules: [
//             Validator.isEmail('#email'),
//             Validator.minLength('#password', 6),
//           ],
//           onSubmit: function (data) {
//             // Call API
//             console.log(data);
//           }
//         });
//       });
// ReactDOM.render(
  
//     <App />
//   ,
//   document.getElementById('main')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

