package com.seridian.chat.client

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "seridian_chat")

object PlatformPreferences {
    private val DEPLOYMENT_URL = stringPreferencesKey("deployment_url")
    private val PUBKEY = stringPreferencesKey("pubkey")
    private val DISPLAY_NAME = stringPreferencesKey("display_name")

    suspend fun saveConnection(context: Context, deploymentUrl: String, pubkey: String, displayName: String) {
        context.dataStore.edit { prefs ->
            prefs[DEPLOYMENT_URL] = deploymentUrl
            prefs[PUBKEY] = pubkey
            prefs[DISPLAY_NAME] = displayName
        }
    }

    suspend fun getConnection(context: Context): Triple<String, String, String>? {
        val prefs = context.dataStore.data.map { it }.first()
        val url = prefs[DEPLOYMENT_URL] ?: return null
        val pubkey = prefs[PUBKEY] ?: return null
        val name = prefs[DISPLAY_NAME] ?: return null
        return Triple(url, pubkey, name)
    }

    suspend fun clear(context: Context) {
        context.dataStore.edit { it.clear() }
    }
}
