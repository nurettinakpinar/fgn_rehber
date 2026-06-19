import React from 'react';

import { BaseTextFieldProps, InputAdornment, MenuItem, Select, TextField, Typography, } from '@mui/material';
import { CountryIso2, defaultCountries, parseCountry, usePhoneInput, } from 'react-international-phone';
import 'react-international-phone/style.css';

const flagEmoji = (iso2: string) =>
    [...iso2.toUpperCase()].map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');

export interface MUIPhoneProps extends BaseTextFieldProps {
    value: string;
    onChange: (phone: string) => void;
}

export const PhoneInput: React.FC<MUIPhoneProps> = ({ value, onChange, ...restProps }) => {
    const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
        usePhoneInput({
            defaultCountry: 'tr',
            value,
            countries: defaultCountries,
            onChange: (data) => {
                onChange(data.phone);
            },
        });

    return (
        <TextField
            variant="outlined"
            label="İş Telefon Numarası"
            color="primary"
            placeholder="Tel. No"
            value={inputValue}
            onChange={handlePhoneValueChange}
            type="tel"
            inputRef={inputRef}
            InputProps={{
                startAdornment: (
                    <InputAdornment
                        position="start"
                        style={{ marginRight: '2px', marginLeft: '-8px' }}
                    >
                        <Select
                            MenuProps={{
                                style: {
                                    height: '300px',
                                    width: '360px',
                                    top: '10px',
                                    left: '-34px',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                            sx={{
                                width: 'max-content',
                                // Remove default outline (display only on focus)
                                fieldset: {
                                    display: 'none',
                                },
                                '&.Mui-focused:has(div[aria-expanded="false"])': {
                                    fieldset: {
                                        display: 'block',
                                    },
                                },
                                // Update default spacing
                                '.MuiSelect-select': {
                                    padding: '8px',
                                    paddingRight: '24px !important',
                                },
                                svg: {
                                    right: 0,
                                },
                            }}
                            value={country.iso2}
                            onChange={(e) => setCountry(e.target.value as CountryIso2)}
                            renderValue={(value) => (
                                <span style={{ display: 'flex', fontSize: '1.4rem', lineHeight: 1 }}>{flagEmoji(value)}</span>
                            )}
                        >
                            {defaultCountries.map((c) => {
                                const country = parseCountry(c);
                                return (
                                    <MenuItem key={country.iso2} value={country.iso2}>
                                        <span style={{ marginRight: '8px', fontSize: '1.2rem' }}>{flagEmoji(country.iso2)}</span>
                                        <Typography marginRight="8px">{country.name}</Typography>
                                        <Typography color="gray">+{country.dialCode}</Typography>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </InputAdornment>
                ),
            }}
            {...restProps}
        />
    );
};