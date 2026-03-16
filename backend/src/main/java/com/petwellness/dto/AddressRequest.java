package com.petwellness.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String fullName;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String postalCode;
}
