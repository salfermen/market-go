package com.marketgo.service

import com.marketgo.models.Voucher
import com.marketgo.repository.VoucherRepository
import com.marketgo.utils.BadRequest
import com.marketgo.utils.Dates
import com.marketgo.utils.NotFound

class VoucherService(private val vouchers: VoucherRepository) {

    suspend fun list(): List<Voucher> = vouchers.findAll().sortedBy { it.id }

    suspend fun getByCode(code: String): Voucher =
        vouchers.findByCode(code) ?: throw NotFound("Ese cupón no existe")

    /** Cupón válido para comprar hoy (existe y no ha expirado). */
    suspend fun requireUsable(code: String): Voucher {
        val voucher = getByCode(code)
        if (voucher.expires.isNotBlank() && Dates.parseDate(voucher.expires) < Dates.today()) {
            throw BadRequest("El cupón ${voucher.code} ya expiró")
        }
        return voucher
    }
}
