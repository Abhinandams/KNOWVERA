package com.knowvera.dto;

import lombok.Data;

@Data
public class RegisterAdminRequestDTO {
    private String fname;
    private String lname;
    private String email;
    private String password;
    private String phone;
    private String address;
}
