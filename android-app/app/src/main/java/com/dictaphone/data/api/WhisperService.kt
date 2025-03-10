package com.dictaphone.data.api

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import retrofit2.Response
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

data class TranscriptionResponse(
    val text: String
)

interface WhisperApi {
    @Multipart
    @POST("v1/audio/transcriptions")
    suspend fun transcribe(
        @Header("Authorization") authorization: String,
        @Part file: MultipartBody.Part,
        @Part("model") model: MultipartBody.Part,
        @Part("language") language: MultipartBody.Part,
        @Part("response_format") responseFormat: MultipartBody.Part
    ): Response<TranscriptionResponse>
}

@Singleton
class WhisperService @Inject constructor(
    private val api: WhisperApi
) {
    suspend fun transcribe(
        apiKey: String,
        audioFile: File,
        language: String = "fr"
    ): Result<String> {
        return try {
            val fileRequestBody = audioFile.asRequestBody("audio/mp3".toMediaTypeOrNull())
            val filePart = MultipartBody.Part.createFormData("file", audioFile.name, fileRequestBody)
            val modelPart = MultipartBody.Part.createFormData("model", "whisper-1")
            val languagePart = MultipartBody.Part.createFormData("language", language)
            val formatPart = MultipartBody.Part.createFormData("response_format", "json")

            val response = api.transcribe(
                authorization = "Bearer $apiKey",
                file = filePart,
                model = modelPart,
                language = languagePart,
                responseFormat = formatPart
            )

            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it.text)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Transcription failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
