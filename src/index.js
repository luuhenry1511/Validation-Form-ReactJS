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
        
        var errorElement = getParent(inputElement, options.formGroupSlector).querySelector(options.errorSelector);
        var errorMessage;
        //lấy các rules của 1 selector
        var rules = selectorRules[rule.selector];

        //lặp qua từng rule và kiểm tra
        //nếu có lỗi thì dừng việc kiểm tra
        for (var i=0; i<rules.length; ++i){
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }          
                    if (errorMessage){
                        errorElement.innerText = errorMessage;
                        getParent(inputElement, options.formGroupSlector).classList.add('invalid');
                    } else {
                        errorElement.innerText = "";
                        getParent(inputElement, options.formGroupSlector).classList.remove('invalid');
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
                    values[input.name] = input.value
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
                    var errorElement = inputElement.parentElement.querySelector('.form-message');
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
            
        });
       
    }
    
}
Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
           return( value.trim() ? undefined :  message ||'Vui lòng nhập vào trường này');
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
 document.addEventListener('DOMContentLoaded', function () {
        // Mong muốn của chúng ta
        Validator({
          form: '#form-1',
          errorSelector: '.form-message',
          formGroupSelector: './form-group',
          rules: [
            Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ của bạn'),
            Validator.isRequired('#email'),
            Validator.isEmail('#email'),
            Validator.isRequired("#password"),
            Validator.minLength('#password',6),
            Validator.isRequired('#password_confirmation', 'Vui lòng nhập mật khẩu'),
            Validator.isConfirmed("#password_confirmation", function(){
                return document.querySelector("#form-1 #password").value;
            }, 'Mật khẩu nhập lại không chính xác'),
            
          ],
          onSubmit: function(data) {
              //call API
              console.log(data);
          }
          
        });
  
  
        // Validator({
        //   form: '#form-2',
        //   formGroupSelector: '.form-group',
        //   errorSelector: '.form-message',
        //   rules: [
        //     Validator.isEmail('#email'),
        //     Validator.minLength('#password', 6),
        //   ],
        //   onSubmit: function (data) {
        //     // Call API
        //     console.log(data);
        //   }
        // });
      });
// ReactDOM.render(
  
//     <App />
//   ,
//   document.getElementById('main')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

