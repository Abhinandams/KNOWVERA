package com.knowvera.dto;

import lombok.Data;

@Data
public class UserUpdateRequestDTO {

    private String fname;
    private String lname;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String role;
    private String status;
}
